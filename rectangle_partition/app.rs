use std::io;

macro_rules! parse_input {
    ($x:expr, $t:ident) => ($x.trim().parse::<$t>().unwrap())
}

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
fn main() {
    let mut input_line = String::new();
    io::stdin().read_line(&mut input_line).unwrap();
    let inputs = input_line.split(" ").collect::<Vec<_>>();
    let w = parse_input!(inputs[0], i32);
    let h = parse_input!(inputs[1], i32);
    let count_x = parse_input!(inputs[2], i32);
    let count_y = parse_input!(inputs[3], i32);

    let mut inputs = String::new();
    io::stdin().read_line(&mut inputs).unwrap();
    let mut x_measurements = vec![0];
    for i in inputs.split_whitespace() {
        //let x = parse_input!(i, i32);
        x_measurements.push(parse_input!(i, i32));
    }
    x_measurements.push(w);
    eprintln!("x_measurements: {:?}", x_measurements);

    let mut inputs = String::new();
    io::stdin().read_line(&mut inputs).unwrap();
    let mut y_measurements = vec![0];
    for i in inputs.split_whitespace() {
        //let y = parse_input!(i, i32);
        y_measurements.push(parse_input!(i, i32));
    }
    y_measurements.push(h);
    eprintln!("y_measurements: {:?}", y_measurements);

    // Write an answer using println!("message...");
    // To debug: eprintln!("Debug message...");

    println!("0");
}
