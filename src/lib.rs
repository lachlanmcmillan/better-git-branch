use std::io;
use std::sync::mpsc;
use std::thread;
use termion::event::Key;
use termion::input::TermRead;
use tui::widgets::ListState;

/// A small event handler that wrap termion input and tick events. Each event
/// type is handled in its own thread and returned to a common `Receiver`
pub struct Events {
    receiver: mpsc::Receiver<Key>,
}

impl Events {
    pub fn new() -> Events {
        // how is it inferring the correct type here?
        let (sender, receiver) = mpsc::channel();
        {
            let sender = sender.clone();
            // what I think is going on here:
            // Spawn a new cpu thread. 'move' means that the thread will take 
            // ownership of whatever it uses – stdin & sender in this case.
            // This means that no other code can access these whilst the thread
            // is active.
            //  
            thread::spawn(move || {
                let stdin = io::stdin();
                for evt in stdin.keys() {
                    match evt {
                        Ok(key) => {
                            if let Err(_) = sender.send(key) {
                                return;
                            }
                        }
                        Err(_) => {}
                    }
                }
            })
        };
        Events {
            receiver,
        }
    }

    pub fn next(&self) -> Result<Key, mpsc::RecvError> {
        self.receiver.recv()
    }
}

pub struct BranchList {
    pub branches: Vec<String>,
    pub selected_index: usize,
    pub current_index: usize,
}

impl BranchList {
    pub fn select_next(&mut self) {
        let new_index = {
            if self.selected_index >= self.branches.len() -1 {
                0 // wrap to first
            } else {
                self.selected_index + 1
            }
        };
        self.selected_index = new_index;
    }

    pub fn select_prev(&mut self) {
        let new_index = {
            if self.selected_index == 0 {
                self.branches.len() - 1
            } else {
                self.selected_index - 1
            }
        };
        self.selected_index = new_index;
    }

    pub fn remove_selected(&mut self) {
        self.branches.remove(self.selected_index); 
        if self.selected_index >= self.branches.len() {
            self.selected_index = self.branches.len() - 1 
        }
    }

    pub fn is_current_selected(&self) -> bool {
        self.selected_index == self.current_index
    }

    pub fn get_selected_branch_name(&self) -> &String {
        &self.branches[self.selected_index]
    }
}
