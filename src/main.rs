mod util;

use std::io;
use std::process::{
    Command,
    Output
};
use tui::{
    backend::TermionBackend,
    widgets::{Text, List, ListState, Block},
    style::{Style, Color},
    Terminal
};
use termion::{
    raw::IntoRawMode,
    event::Key,
    screen::AlternateScreen
};

use crate::util::Events;

enum Commands {
    Checkout,
    Exit
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let (branches, current_branch_index) = match git_read_branches() {
        Ok(x) => x,
        Err(e) => {
            println!("{}", e);
            return Ok(());
        }
    };

    let mut list_state = ListState::default();
    list_state.select(current_branch_index);

    let command: Commands;
    let events = Events::new();

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

                let text_items = branches.iter().map(|x| Text::raw(x));

                let list = List::new(text_items)
                    .block(Block::default())
                    .highlight_style(Style::default().fg(Color::Green))
                    .highlight_symbol("* ");

                frame.render_stateful_widget(list, size, &mut list_state);
            })?;

            match events.next()? {
                Key::Down => {
                    select_next(branches.len(), &mut list_state);
                }
                Key::Up => {
                    select_prev(branches.len(), &mut list_state); 
                }
                Key::Esc | Key::Ctrl('c') | Key::Char('q') => {
                    command = Commands::Exit;
                    break;
                }
                Key::Char('\n') | Key::Char('\r') => {
                    // attempt checkout
                    command = Commands::Checkout;
                    break;
                }
                _ => {}
            }
        }
    }
    // as we exit the above block we return to normal terminal and release 
    // the alternate screen buffer

    match command {
        Commands::Checkout => {
            // get the selected item 
            match list_state.selected() {
                Some(x) => {
                    let branch_name = &branches[x];
                    // println!("{}", branch_name); 
                    let output = git_checkout(&branch_name);
                    println!("{}", output.trim_end()); 
                }
                None => {
                    panic!("error: checkout called without a selected branch")
                }
            }
        }
        _ => { }
    }

    Ok(())
}

pub fn select_next(items_len: usize, list_state: &mut ListState) {
    let i = match list_state.selected() {
        Some(i) => {
            if i >= items_len -1 {
                0
            } else {
                i + 1
            }
        }
        None => 0,
    };
    list_state.select(Some(i));
}

pub fn select_prev(items_len: usize, list_state: &mut ListState) {
    let i = match list_state.selected() {
        Some(i) => {
            if i == 0 {
                items_len - 1
            } else {
                i - 1
            }
        }
        None => 0,
    };
    list_state.select(Some(i));
}

fn get_stdout_string(output: Output) -> String {
    String::from_utf8(output.stdout).unwrap().trim().to_string()
}

fn get_stderr_string(output: Output) -> String {
    String::from_utf8(output.stderr).unwrap().trim().to_string()
}

fn git_read_branches() -> Result<(Vec<String>, Option<usize>), String> {
    // git for-each-ref --count=30 --sort=-committerdate refs/heads/ --format='%(refname:short)'
    let output = Command::new("git")
        .args(&["branch"])
        .output()
        .expect("failed to call git executable");
   
    if output.status.success() {
        let mut branches: Vec<String> = get_stdout_string(output)
            .lines()
            .map(|line| line.trim())
            .map(|line| String::from(line))
            .collect();

        let current_branch_index = branches
            .iter()
            .position(|line| line.starts_with('*'));
        
        match current_branch_index {
            Some(index) => {
                // remove the star from the current branch with a slice
                branches[index] = String::from(&branches[index][2..]);
                return Ok((branches, Some(index)))
            }
            None => return Ok((branches, current_branch_index))
        }
    } else {
       Err(get_stderr_string(output)) 
    }
}

pub fn git_checkout(branch_name: &str) -> String {
    // git checkout <branch>
    let output = Command::new("git")
        .args(&["checkout", branch_name])
        .output()
        .expect("failed to call git executable");

    // if you try to `git checkout` the current branch it will return success, but 
    // actually print to stderr, so we combine the outputs here to print them for 
    // the user
    let output_vec = output.stdout.into_iter().chain(output.stderr.into_iter()).collect();
    String::from_utf8(output_vec).unwrap()
}
