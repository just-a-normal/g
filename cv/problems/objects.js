import { problem as p, topic, expression as e, list as l } from './schema.js';

const account = balance => e('new BankAccount(' + balance + ')', 'BankAccount(' + balance + ')');
const student = (name, score) => e('new Student(' + JSON.stringify(name) + ', ' + score + ')', 'Student(' + JSON.stringify(name) + ', ' + score + ')');
const point = (x, y) => e('new Point(' + x + ', ' + y + ')', 'Point(' + x + ', ' + y + ')');

const bank = `class BankAccount {
    private int balance;
    public BankAccount(int balance) { this.balance = balance; }
    public int getBalance() { return balance; }
    public void setBalance(int balance) { this.balance = balance; }
}`;

const students = `class Student implements Comparable<Student> {
    private final String name;
    private final int score;
    public Student(String name, int score) { this.name = name; this.score = score; }
    public String getName() { return name; }
    public int getScore() { return score; }
    public int compareTo(Student other) {
        int byScore = Integer.compare(other.score, score);
        return byScore == 0 ? name.compareTo(other.name) : byScore;
    }
}`;

const points = `class Point {
    private final int x, y;
    public Point(int x, int y) { this.x = x; this.y = y; }
    public int getX() { return x; }
    public int getY() { return y; }
    @Override public boolean equals(Object other) {
        if (!(other instanceof Point)) return false;
        Point point = (Point) other;
        return x == point.x && y == point.y;
    }
    @Override public int hashCode() { return Objects.hash(x, y); }
}`;

export const objects = topic('oop-basics', 'AP CS A / OOP Basics', 'Objects, state, accessors, and natural ordering.', 'Medium', [
  p('boolean canAfford(BankAccount account, int cost)', 'Return true if the nonnegative cost does not exceed the account balance.', 'Read the balance using its getter.',
    'return account.getBalance() >= cost;',
    [[[account(10),10],true], [[account(5),6],false], [[account(0),0],true], [[account(2),1],true], [[account(0),1],false]], { helpers: bank }),
  p('void applyFee(BankAccount account, int fee)', 'Subtract the nonnegative fee from the account balance. If the fee exceeds the balance, set it to zero. The starting balance is nonnegative.',
    'Use the getter and setter to update the existing account.',
    'account.setBalance(Math.max(0, account.getBalance() - fee));', [],
    { helpers: bank, tests: [[20,3,17],[2,9,0],[5,5,0],[3,0,3],[0,8,0]].map(([balance, fee, expected], i) => ({
      call: 'applyFee(' + account(balance).display + ', ' + fee + ')',
      setup: 'BankAccount input = ' + account(balance).java + '; new Solution().applyFee(input, ' + fee + ');',
      invoke: 'input.getBalance()', expected: String(expected), expectedDisplay: String(expected), hidden: i >= 3
    })) }),
  p('boolean samePoint(Point a, Point b)', 'Determine if two points have equal coordinates. Return true for two null references and false if only one is null.',
    'Objects.equals calls the point’s equals method safely.',
    'return Objects.equals(a, b);',
    [[[point(1,2),point(1,2)],true], [[point(1,2),point(2,1)],false], [[null,point(0,0)],false], [[null,null],true], [[point(-3,1),null],false]], { helpers: points }),
  p('String firstRank(List<Student> roster)', 'Return the name of the first student in natural order. The provided compareTo ranks higher scores first and breaks ties alphabetically. Return empty for an empty roster.',
    'Collections.min returns the first element under natural ordering.',
    'return roster.isEmpty() ? "" : Collections.min(roster).getName();',
    [[[l(student('Mia',90),student('Ari',91))],'Ari'], [[l(student('Zoe',90),student('Ava',90))],'Ava'], [[l()],''], [[l(student('Sam',0))],'Sam'], [[l(student('Bo',70),student('Al',1))],'Bo']], { helpers: students }),
  p('long manhattan(Point a, Point b)', 'Return the sum of the absolute differences in X and Y coordinates. Both points are present and coordinates may span the full int range.',
    'Widen before subtracting each pair of coordinates.',
    'return Math.abs((long) a.getX() - b.getX()) + Math.abs((long) a.getY() - b.getY());',
    [[[point(0,0),point(3,4)],e('7L','7')], [[point(-2,5),point(1,3)],e('5L','5')], [[point(4,4),point(4,4)],e('0L','0')], [[point(-2147483648,0),point(2147483647,0)],e('4294967295L','4294967295')], [[point(3,9),point(3,1)],e('8L','8')]], { helpers: points })
]);
