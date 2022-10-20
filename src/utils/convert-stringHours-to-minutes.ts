export function convertStringHourToMinute(hourString: String): number {
    const [hours, minutes] = hourString.split(":").map(Number)
    const minutesAmount = hours*60 + minutes
    return minutesAmount;
}

