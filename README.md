# dipped.dev
This repository contains the source code and assets required to build [dipped.dev](https://dipped.dev) and all its subdomains


## Prerequisites

To use this repository, you need the following installed locally:

- [rust](https://rust-lang.org/)
- [cmake](https://cmake.org/)

Before you start, install the dependencies. Clone the repository and navigate to the directory:

```bash
git clone https://github.com/dip-land/dipped.dev.git
cd dipped.dev
```

Create a .env file and populate it with the contents from .env.example

Running dipped.dev
Port is an optional argument
```powershell
cargo run --bin dipped_dev -- --port 6570
```

Running minecraft.dipped.dev
Port is an optional argument
```powershell
cargo run --bin minecraft -- --port 6571
```

Running re.dipped.dev
Port is an optional argument
```powershell
cargo run --bin role_eater -- --port 6572
```

Running r6.dipped.dev
Port is an optional argument
```powershell
cargo run --bin rainbow_six -- --port 6573
```

### Building

To build the repo run

Building dipped.dev
```powershell
cargo build --bin dipped_dev --release
```

Building minecraft.dipped.dev
```powershell
cargo build --bin minecraft --release
```

Building re.dipped.dev
```powershell
cargo build --bin role_eater --release
```

Building r6.dipped.dev
```powershell
cargo build --bin rainbow_six --release
```

Building All
```powershell
cargo build --bins --release
```

Then put a .env file in the same directory as the executable, and then you can run the executable.