const options = {
  reporters: {
    myConsoleReporter: [
      {
        module: "good-squeeze",
        name: "Squeeze",
        args: [{ log: "*", response: "*" }]
      },
      {
        module: "good-console"
      },
      "stdout"
    ]
  }
};

export default options;
