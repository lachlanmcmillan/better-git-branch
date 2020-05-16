use std::process::Command;

fn main() {
    let output = Command::new("git")
        .args(&["for-each-ref", "--count=20", "--format='%(refname:short)'"])
        .output().expect("failed to execute process");
    // assuming the stdout Vec is utf8
    let output_as_string = String::from_utf8(output.stdout).unwrap();
    // let lines = output_as_string.split('\n');
    println!("{}", output_as_string);
}

//git for-each-ref --count=30 --sort=-committerdate refs/heads/ --format='%(refname:short)'
