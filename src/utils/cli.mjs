$.verbose = false;
process.stdin.isTTY = false;

export function exit_error(message) {
    console.log(chalk.red(message));
    process.exit(1);
}