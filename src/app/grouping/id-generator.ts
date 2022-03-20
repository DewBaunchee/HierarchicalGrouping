export class IdGenerator {

    private readonly letters: string = "abcdefghijklmnopqrstuvwxyz";

    private currentIndex: number = -1;

    public next(): string {
        return this.letters.charAt(this.currentIndex = (this.currentIndex + 1) % this.letters.length);
    }
}
