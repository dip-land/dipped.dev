# dipped.dev
This repository contains the source code and assets required to build [dipped.dev](https://dipped.dev) and [r6.dipped.dev](https://r6.dipped.dev)


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
Port is is an optional argument
```powershell
cargo run --bin dipped_dev -- --port 6570
```

Running r6.dipped.dev
Port is is an optional argument
```powershell
cargo run --bin r6_dipped_dev -- --port 6571
```

### Building

To build the repo run

Building dipped.dev
```powershell
cargo build --bin dipped_dev --release
```

Building r6.dipped.dev
```powershell
cargo build --bin r6_dipped_dev --release
```

Building Both
```powershell
cargo build --bins --release
```

Then put a .env file in the same directory as the executable and then you can run the executable.