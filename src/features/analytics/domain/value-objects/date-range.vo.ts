export class DateRange {
    constructor(
        public readonly startDate: Date,
        public readonly endDate: Date,
    ) {
        if (startDate > endDate) {
            throw new Error('Start date cannot be after end date');
        }
    }

    static currentMonth(): DateRange {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return new DateRange(startDate, endDate);
    }

    static previousMonth(): DateRange {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return new DateRange(startDate, endDate);
    }

    static fromDates(start: Date | string, end: Date | string): DateRange {
        const startDate = typeof start === 'string' ? new Date(start) : start;
        const endDate = typeof end === 'string' ? new Date(end) : end;

        // Ensure end date covers the full day if no time is provided/implied
        if (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {
            endDate.setHours(23, 59, 59, 999);
        }

        return new DateRange(startDate, endDate);
    }

    getPreviousRange(): DateRange {
        const duration = this.endDate.getTime() - this.startDate.getTime();
        const prevEndDate = new Date(this.startDate.getTime() - 1);
        const prevStartDate = new Date(prevEndDate.getTime() - duration);
        return new DateRange(prevStartDate, prevEndDate);
    }
}
