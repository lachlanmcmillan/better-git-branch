mod util;

use std::io;
use std::process::Command;
use crate::util::{
    Event,
    Events
};
use tui::{
    backend::TermionBackend,
    widgets::{Text, List, ListState, Block, Borders},
    style::{Style, Color, Modifier},
    // layout::{Layout, Constraint, Direction},
    Terminal
};
use termion::{
    raw::IntoRawMode,
    event::Key,
    screen::AlternateScreen
};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let stdout = io::stdout().into_raw_mode()?;
    let stdout = AlternateScreen::from(stdout);
    let backend = TermionBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    terminal.hide_cursor()?;

    let output_as_string = read_branches();
    // println!("{}", output_as_string);

    let events = Events::new();

    let items: Vec<&str> = output_as_string
        .split('\n')
        .collect();

    let mut list_state = ListState::default();

    list_state.select(Some(0));

    loop {
        terminal.draw(|mut f| {
            let size = f.size();

            let text_items = items.iter().map(|x| Text::raw(*x));

            // let style = Style::default().fg(Color::Black).bg(Color::White);

            let block = Block::default();
                // .style(style);
            let list = List::new(text_items)
                .block(block)
                .style(Style::default())
                .highlight_style(Style::default().fg(Color::Green))
                .highlight_symbol("* ");

            f.render_stateful_widget(list, size, &mut list_state);
        })?;
        match events.next()? {
            Event::Input(input) => match input {
                Key::Char('q') => {
                    break;
                }
                Key::Down => {
                    select_next(items.len(), &mut list_state);
                }
                Key::Up => {
                    select_prev(items.len(), &mut list_state); 
                }
                Key::Char('\n') => {
                    // attempt checkout
                    break;
                }
                _ => {}
            }
            Event::Tick => {

            }
        }
    }

    Ok(())
}

fn read_branches() -> String {
    //git for-each-ref --count=30 --sort=-committerdate refs/heads/ --format='%(refname:short)'
    let output = Command::new("git")
        .args(&["for-each-ref", "--count=20", "--format=%(refname:short)"])
        .output().expect("failed to execute process");
    // assuming the stdout Vec is utf8
    String::from_utf8(output.stdout).unwrap()
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

