use std::process::Command;

fn main() {
    let output = Command::new("git")
        .args(&["for-each-ref", "--count=20"])
        .output().expect("failed to execute process");
    println!("output = {:?}", output.stdout);
}

//git for-each-ref --count=30 --sort=-committerdate refs/heads/ --format='%(refname:short)'
