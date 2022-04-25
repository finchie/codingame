import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.stream.Collectors;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
class Player {

    private static class Entity {

        static final int MONSTER = 0;
        static final int HERO = 1;
        static final int ENEMY = 2;

        int id; // Unique identifier
        int type; // 0=monster, 1=your hero, 2=opponent hero
        int x; // horizontal position of this entity
        int y ; // vertical position of this entity

        int shieldLife; // Ignore for this league; Count down until shield spell fades
        int isControlled; // Ignore for this league; Equals 1 when this entity is under a control spell

        int health; // Remaining health of this monster
        int vx ; // horizontal trajectory of this monster
        int vy; // vertical trajectory of this monster
        int nearBase; // 0=monster with no target yet, 1=monster targeting a base
        int threatFor; // Given this monster's trajectory, is it a threat to 1=your base, 2=your opponent's base, 0=neither

        /**
         * @param id unique identifier
         * @param type 0=monster, 1=your hero, 2=opponent hero
         * @param x horizontal position of this entity
         * @param y vertical position of this entity
         * @param shieldLife count down until shield spell fades
         * @param isControlled equals 1 when this entity is under a control spell
         * @param health remaining health of this monster
         * @param vx horizontal trajectory of this monster
         * @param vy vertical trajectory of this monster
         * @param nearBase 0=monster with no target yet, 1=monster targeting a base
         * @param threatFor given this monster's trajectory, is it a threat to 1=your base, 2=your opponent's base, 0=neither
         */
        public Entity(int id, int type, int x, int y, int shieldLife, int isControlled, int health, int vx, int vy,
                int nearBase, int threatFor) {
            this.id = id;
            this.type = type;
            this.x = x;
            this.y = y;
            this.shieldLife = shieldLife;
            this.isControlled = isControlled;
            this.health = health;
            this.vx = vx;
            this.vy = vy;
            this.nearBase = nearBase;
            this.threatFor = threatFor;
        }

        public int distance(int baseX, int baseY) {
            return (int) Math.hypot(this.x - baseX, this.y - baseY);
        }

        public String toString() {
            return String.format("%d: %s (%d, %d)", this.id, (this.type == MONSTER ? "monster" : (this.type == HERO ? "me" : "enemy")), this.x, this.y);
        }
    }

    int health;
    int mana;

    public static void main(String args[]) {
        Scanner in = new Scanner(System.in);
        int baseX = in.nextInt(); // The corner of the map representing your base
        int baseY = in.nextInt();
        int heroesPerPlayer = in.nextInt(); // Always 3
        List<Entity> entities;
        List<Entity> heroes;
        List<Entity> enemies;
        List<Entity> monsters;

        // game loop
        while (true) {
            Player myPlayer = new Player();
            myPlayer.health = in.nextInt(); // Each player's base health
            myPlayer.mana = in.nextInt(); // Ignore in the first league; Spend ten mana to cast a spell
            
            Player enemyPlayer = new Player();
            enemyPlayer.health = in.nextInt(); // Each player's base health
            enemyPlayer.mana = in.nextInt(); // Ignore in the first league; Spend ten mana to cast a spell

            int entityCount = in.nextInt(); // Amount of heros and monsters you can see
            entities = new ArrayList<Entity>();
            for (int i = 0; i < entityCount; i++) {
                Entity entity = new Entity(in.nextInt(), in.nextInt(), in.nextInt(), in.nextInt(), in.nextInt(),
                    in.nextInt(), in.nextInt(), in.nextInt(), in.nextInt(), in.nextInt(), in.nextInt());
                entities.add(entity);
            }

            heroes = entities.stream().filter(e -> e.type == Entity.HERO).collect(Collectors.toList());
            enemies = entities.stream().filter(e -> e.type == Entity.ENEMY).collect(Collectors.toList());
            monsters = entities.stream().filter(e -> e.type == Entity.MONSTER).collect(Collectors.toList());

            // rank monsters
            monsters.sort((a, b) -> a.distance(baseX, baseY) - b.distance(baseX, baseY));
            System.err.println("ranked monsters");
            monsters.forEach(m -> System.err.println(m));

            for (int i = 0; i < heroesPerPlayer; i++) {

                // Write an action using System.out.println()
                // To debug: System.err.println("Debug messages...");


                // In the first league: MOVE <x> <y> | WAIT; In later leagues: | SPELL <spellParams>;
                if(monsters.isEmpty() || i >= monsters.size()) {
                    System.out.println("WAIT");
                } else {
                    Entity target = monsters.get(i);
                    System.out.println(String.format("MOVE %d %d", target.x, target.y));
                }
            }
        }
    }

    public String toString() {
        return String.format("Health: %d Mana: %d", this.health, this.mana);
    }
}