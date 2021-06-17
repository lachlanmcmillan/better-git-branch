mod lib;
mod commandbar;
mod strings;

use std::io;
use std::env;
use std::process::{
    Command,
    Output
};
use tui::{
    backend::TermionBackend,
    widgets::{Text, List, ListState, Block},
    style::{Style, Color},
    layout::{Constraint, Direction, Layout},
    Terminal
};
use termion::{
    raw::IntoRawMode,
    event::Key,
    screen::AlternateScreen
};

use crate::lib::Events;
use crate::lib::BranchList;

const VERSION: &'static str = env!("CARGO_PKG_VERSION");

enum Commands {
    Checkout,
    Exit
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    if args.len() > 1 && args[1] == "--version" {
        println!("v{}", VERSION);
        return Ok(());
    }


    let mut bl: BranchList = match git_read_branches() {
        Ok(x) => x,
        Err(e) => {
            println!("{}", e);
            return Ok(());
        }
    };

    let command: Commands;
    let events = Events::new();
    let mut show_actions: bool = false;
    let mut command_bar_text: Option<String> = None;

    {
        // set up termion and tui
        let stdout = io::stdout().into_raw_mode()?;
        let stdout = AlternateScreen::from(stdout);
        let backend = TermionBackend::new(stdout);
        let mut terminal = Terminal::new(backend)?;
        terminal.hide_cursor()?;

        loop {
            terminal.draw(|mut frame| {
                let size = frame.size();

                let chunks = Layout::default()
                    .direction(Direction::Vertical)
                    .margin(0)
                    .constraints(
                        [
                            Constraint::Min(2),
                            Constraint::Length(1),
                        ]
                        .as_ref(),
                    )
                    .split(size);

                let text_items = bl.branches.iter().map(|x| Text::raw(x));

                let list = List::new(text_items)
                    .block(Block::default())
                    .highlight_style(Style::default().fg(Color::Green))
                    .highlight_symbol(strings::HIGHLIGHT_SYMBOL);

                let mut selected = ListState::default();
                selected.select(Some(bl.selected_index));

                frame.render_stateful_widget(list, chunks[0], &mut selected);
                match &command_bar_text {
                    Some(x) => { 
                        commandbar::render_text(chunks[1], &mut frame, &x);
                        // only render it for a single loop
                        command_bar_text = None;
                    }
                    None => commandbar::render(chunks[1], &mut frame, show_actions)
                }
            })?;

            match events.next()? {
                Key::Down => {
                    show_actions = false; 
                    bl.select_next();
                }
                Key::Up => {
                    show_actions = false; 
                    bl.select_prev(); 
                }
                Key::Char('a') => {
                    show_actions = !show_actions;
                }
                Key::Char('d') => {
                    if show_actions { 
                        let is_head_detached = false; // TODO
                        if bl.is_current_selected() || is_head_detached {
                            command_bar_text = Some(String::from(strings::DELETE_BRANCH_PROHIBITED));
                            continue;
                        }
                        let branch_name = bl.get_selected_branch_name();
                        let output_buff = match git_branch_delete(&branch_name, false) {
                          Ok(output) => output,
                          Err(output) => output
                        };
                        bl.remove_selected();
                        // print to command bar
                        command_bar_text = Some(output_buff);
                    }
                }
                Key::Esc | Key::Ctrl('c') | Key::Char('q') => {
                    if show_actions || command_bar_text.is_some() { 
                        show_actions = false;
                    } else {
                        command = Commands::Exit;
                        break;
                    }
                }
                Key::Char('\n') | Key::Char('\r') => {
                    if show_actions { 
                        show_actions = false; 
                    } else {
                        // attempt checkout
                        command = Commands::Checkout;
                        break;
                    }
                }
                _ => { }
            }
        }
    }
    // as we exit the above block we return to normal terminal and release 
    // the alternate screen buffer

    match command {
        Commands::Checkout => {
            // get the selected item 
            if !bl.is_current_selected() {
                let output = git_checkout(bl.get_selected_branch_name());
                println!("{}", output.trim_end()); 
            }
        }
        _ => { }
    }

    Ok(())
}

fn get_stdout_string(output: Output) -> String {
    String::from_utf8(output.stdout).unwrap().trim().to_string()
}

fn get_stderr_string(output: Output) -> String {
    String::from_utf8(output.stderr).unwrap().trim().to_string()
}

fn git_read_branches() -> Result<BranchList, String> {
    // git for-each-ref --count=30 --sort=-committerdate refs/heads/ --format='%(refname:short)'
    let output = Command::new("git")
        .args(&["branch"])
        .output()
        .expect(strings::GIT_FAIL);
   
    if output.status.success() {
        let mut branches: Vec<String> = get_stdout_string(output)
            .lines()
            .map(|line| line.trim())
            .map(|line| String::from(line))
            .collect();

        let current_branch_index = branches
            .iter()
            .position(|line| line.starts_with('*'))
            .unwrap(); // is there a case where this could fail?
        
        // remove the star from the current branch with a slice
        branches[current_branch_index] = String::from(&branches[current_branch_index][2..]) + " (CURRENT)";

        return Ok(BranchList {
            branches: branches,
            selected_index: current_branch_index,
            current_index: current_branch_index,
        })
    } else {
        Err(get_stderr_string(output)) 
    }
}

pub fn git_checkout(branch_name: &str) -> String {
    // git checkout <branch>
    let output = Command::new("git")
        .args(&["checkout", branch_name])
        .output()
        .expect(strings::GIT_FAIL);

    // if you try to `git checkout` the current branch it will return success, but 
    // actually print to stderr, so we combine the outputs here to print them for 
    // the user
    let output_vec = output.stdout.into_iter().chain(output.stderr.into_iter()).collect();
    String::from_utf8(output_vec).unwrap()
}

pub fn git_branch_delete(branch_name: &str, force: bool) -> Result<String, String> {
    let option_text = match force {
        true => "-D",
        false => "-d"
    };
    let output = Command::new("git")
        .args(&["branch", option_text, branch_name])
        .output()
        .expect(strings::GIT_FAIL);

    let output_vec = output.stdout.into_iter().chain(output.stderr.into_iter()).collect();
    Ok(String::from_utf8(output_vec).unwrap())
    // no output from git means success here
}
