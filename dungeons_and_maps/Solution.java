package dungeons_and_maps;

import static java.util.Comparator.comparingInt;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Scanner;
import java.util.Set;
import java.util.stream.IntStream;

class Solution {

    static final char UP = '^';
    static final char DOWN = 'v';
    static final char LEFT = '<';
    static final char RIGHT = '>';
    static final char TREASURE = 'T';

    static final int INVALID_PATH_LENGTH = Integer.MAX_VALUE;

    public static void main(String args[]) {
        Scanner in = new Scanner(System.in);
        int w = in.nextInt();
        int h = in.nextInt();
        int startRow = in.nextInt();
        int startCol = in.nextInt();
        int n = in.nextInt();
        if (in.hasNextLine()) {
            in.nextLine();
        }

        List<char[][]> maps = new ArrayList<char[][]>();
        for (int i = 0; i < n; i++) {
            char[][] map = new char[h][w];
            for (int j = 0; j < h; j++) {
                String mapRow = in.nextLine();
                map[j] = mapRow.toCharArray();
            }
            maps.add(map);
        }

        // find path lengths
        List<Integer> paths = new ArrayList<Integer>();
        for (char[][] map: maps) {
            paths.add(measurePath(map, startRow, startCol));
        }

        // find shortest path
        int minIndex = IntStream.range(0, paths.size()).boxed().min(comparingInt(paths::get)).get();

        if (paths.get(minIndex) == INVALID_PATH_LENGTH) {
            System.out.println("TRAP");
        } else {
            System.out.println(minIndex);
        }
    }

    private static int measurePath(char[][] map, int startRow, int startCol) {

        int pathLength = 0, row = startRow, col = startCol;
        Set<Position> visitedPositions = new HashSet<Position>();
        do {
            if (visitedPositions.add(new Position(row, col))) {
                switch (map[row][col]) {
                    case UP:
                        if (row == 0) {
                            pathLength = INVALID_PATH_LENGTH;
                        } else {
                            row--;
                            pathLength++;
                        }
                        break;
                    case DOWN:
                        if (row == map.length - 1) {
                            pathLength = INVALID_PATH_LENGTH;
                        } else {
                            row++;
                            pathLength++;
                        }
                        break;
                    case LEFT:
                        if (col == 0) {
                            pathLength = INVALID_PATH_LENGTH;
                        } else {
                            col--;
                            pathLength++;
                        }
                        break;
                    case RIGHT:
                        if (col == map[row].length - 1) {
                            pathLength = INVALID_PATH_LENGTH;
                        } else {
                            col++;
                            pathLength++;
                        }
                        break;
                    default:
                        pathLength = INVALID_PATH_LENGTH;
                }
            } else {
                pathLength = INVALID_PATH_LENGTH; // infinite loop
            }
        } while (map[row][col] != TREASURE && pathLength != INVALID_PATH_LENGTH);

        if (map[row][col] == TREASURE) {
            pathLength++;
        }
        return pathLength;
    }
}

class Position {
    final int row;
    final int col;
    Position(int row, int col) {
        this.row = row;
        this.col = col;
    }
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + col;
        result = prime * result + row;
        return result;
    }
    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || getClass() != obj.getClass())
            return false;
        Position other = (Position) obj;
        return this.col == other.col && this.row == other.row;
    }
}
