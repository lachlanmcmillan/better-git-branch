use std::io;
use std::sync::mpsc;
use std::thread;
use termion::event::Key;
use termion::input::TermRead;

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
