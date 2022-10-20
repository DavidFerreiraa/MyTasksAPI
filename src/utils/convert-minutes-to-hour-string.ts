export default function convertMinutesToHourString(minutes: number): string{

    const hoursString: string = String(Math.floor(minutes / 60)).padStart(2, '0');
    const minutesString: string = String(Math.floor(minutes % 60)).padStart(2, '0');
    const hourminutesAmount: string = [hoursString, minutesString].join(':')

    return hourminutesAmount;

}
