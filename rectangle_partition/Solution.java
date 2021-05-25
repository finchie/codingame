import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
class Solution {

    public static void main(String args[]) {
        
        Scanner in = new Scanner(System.in);
        int w = in.nextInt();
        int h = in.nextInt();
        int countX = in.nextInt();
        int countY = in.nextInt();

        List<Integer> xMeasurements = getMeasurements(in, countX, w);
        // System.err.println("xMeasurements " + xMeasurements);

        List<Integer> yMeasurements = getMeasurements(in, countY, h);
        // System.err.println("yMeasurements " + yMeasurements);

        List<Integer> xSides = getSides(xMeasurements);
        // System.err.println("xSides " + xSides);

        List<Integer> ySides = getSides(yMeasurements);
        // System.err.println("ySides " + ySides);

        // count squares
        int count = 0;
        for (Integer x: xSides) {
            for (Integer y: ySides) {
                if (x.equals(y)) {
                    count++;
                }
            }
        }

        // Write an answer using System.out.println()
        // To debug: System.err.println("Debug messages...");

        System.out.println(count);
    }

    private static List<Integer> getMeasurements(Scanner in, int count, int finalMeasurement) {
        List<Integer> measurements = new ArrayList<Integer>();
        measurements.add(0);
        for (int i = 0; i < count; i++) {
            int m = in.nextInt();
            measurements.add(m);
        }
        measurements.add(finalMeasurement);

        return measurements;
    }

    private static List<Integer> getSides(List<Integer> measurements) {
        List<Integer> sides= new ArrayList<Integer>();
        for (int startIndex = 0; startIndex < measurements.size() -1; startIndex++) {
            for (int endIndex = startIndex + 1; endIndex < measurements.size(); endIndex++) {
                sides.add(measurements.get(endIndex) - measurements.get(startIndex));
            }
        }

        return sides;
    }
}