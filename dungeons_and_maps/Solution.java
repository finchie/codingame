package dungeons_and_maps;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Scanner;
import java.util.Set;

class Solution {

    static final char UP = '^';
    static final char DOWN = 'v';
    static final char LEFT = '<';
    static final char RIGHT = '>';
    static final char TREASURE = 'T';

    public static void main(String args[]) {

        List<char[][]> maps = new ArrayList<char[][]>();
        Position start;

        try (Scanner in = new Scanner(System.in)) {
            int w = in.nextInt();
            int h = in.nextInt();
            int startRow = in.nextInt();
            int startCol = in.nextInt();
            int n = in.nextInt();
            if (in.hasNextLine()) {
                in.nextLine();
            }

            start = new Position(startRow, startCol);

            for (int i = 0; i < n; i++) {
                char[][] map = new char[h][w];
                for (int j = 0; j < h; j++) {
                    String mapRow = in.nextLine();
                    map[j] = mapRow.toCharArray();
                }
                maps.add(map);
            }
        }

        // find shortest path
        int shortestPath = Integer.MAX_VALUE;
        int mapWithShortestPath = -1;
        for (int index = 0; index < maps.size(); index++) {
            int length = measurePath(maps.get(index), start);
            if (length < shortestPath) {
                shortestPath = length;
                mapWithShortestPath = index;
            }
        }

        if (shortestPath == Integer.MAX_VALUE) {
            System.out.println("TRAP");
        } else {
            System.out.println(mapWithShortestPath);
        }
    }

    // measure the path length from the starting position to the treasure
    private static int measurePath(char[][] map, Position start) {

        int pathLength = 0, row = start.row, col = start.col;
        Set<Position> visited = new HashSet<Position>();
        do {
            if (visited.add(new Position(row, col))) {
                switch (map[row][col]) {
                    case UP:
                        if (row == 0) {
                            return Integer.MAX_VALUE; // out of bounds
                        } else {
                            row--;
                        }
                        break;
                    case DOWN:
                        if (row == map.length - 1) {
                            return Integer.MAX_VALUE; // out of bounds
                        } else {
                            row++;
                        }
                        break;
                    case LEFT:
                        if (col == 0) {
                            return Integer.MAX_VALUE; // out of bounds
                        } else {
                            col--;
                        }
                        break;
                    case RIGHT:
                        if (col == map[row].length - 1) {
                            return Integer.MAX_VALUE; // out of bounds
                        } else {
                            col++;
                        }
                        break;
                    case TREASURE:
                        break;
                    default:
                        return Integer.MAX_VALUE; // no path
                }
            } else {
                return Integer.MAX_VALUE; // infinite loop
            }
            pathLength++;
        } while (map[row][col] != TREASURE);

        return pathLength;
    }
}

// represents a position on a map
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
    // required for indentity when added to Set
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
