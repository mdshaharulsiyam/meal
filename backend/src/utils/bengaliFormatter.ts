export class BengaliFormatter {
  private static bengaliDigits: { [key: string]: string } = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
    '.': '.'
  };

  public static toBengaliNumerals(value: number | string): string {
    const str = value.toString();
    return str
      .split('')
      .map((char) => BengaliFormatter.bengaliDigits[char] || char)
      .join('');
  }

  public static formatBDT(amount: number, isBengali: boolean = false): string {
    const formattedNum = (Math.round((amount + Number.EPSILON) * 100) / 100).toFixed(2);
    if (isBengali) {
      return `৳${BengaliFormatter.toBengaliNumerals(formattedNum)}`;
    }
    return `৳${formattedNum}`;
  }
}
