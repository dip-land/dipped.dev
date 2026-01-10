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

```powershell
cargo run -- --port 6570
```

### Building

To build the repo run

```powershell
cargo build --release
```

Then put a .env file in the same directory as the executable and then you can run the executable.