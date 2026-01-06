use glob::glob;
use grass;
use std::fs;

fn main() {
    println!("build script");
    for entry in glob("/assets/css/**/*.scss").expect("Failed to read glob pattern") {
        match entry {
            Ok(path) => {
                let scss = fs::read_to_string(&path).unwrap();
                match grass::from_string(scss, &grass::Options::default()) {
                    Ok(css) => {
                        let path = path.to_str().unwrap().replace(".scss", ".css");
                        match fs::write(&path, css) {
                            Ok(_) => {
                                println!("Wrote File {:?}", path)
                            }
                            Err(e) => println!("{:?}", e),
                        }
                    }
                    Err(e) => println!("{:?}", e),
                }
            }
            Err(e) => println!("{:?}", e),
        }
    }
}
