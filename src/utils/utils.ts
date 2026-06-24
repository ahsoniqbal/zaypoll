export function timeAgo(date: string | Date) {
    const parsedDate =
        typeof date === "string"
            ? new Date(date.replace(" ", "T"))
            : date;

    const now = new Date().getTime();
    const past = parsedDate.getTime();

    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const years = Math.floor(days / 365);


    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    if (weeks < 52) return `${weeks} weeks ago`;
    return `${years} years ago`;
}


