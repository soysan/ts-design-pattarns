
// Observer pattern
type Listener<EventType> = (ev: EventType) => void;
function createObserver<EventType>(): {
  subscribe: (listener: Listener<EventType>) => () => void;
  publish: (event: EventType) => void;
} {
  let listeners: Listener<EventType>[] = [];

  return {
    subscribe: (listener: Listener<EventType>): () => void  => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      }
    },
    publish: (event: EventType) => {
      listeners.forEach(l => l(event));
    }
  }
}

interface BeforeSetEvent<T> {
  value: T;
  newValue: T;
}

interface AfterSetEvent<T> {
  value: T;
}

interface Pokemon {
  id: string;
  attack: number;
  defense: number;
}

interface BaseRecord {
  id: string;
}

interface Database<T extends BaseRecord> {
  set(newValue: T): void;
  get(id: string): T | undefined;

  onBeforeAdd(listener: Listener<BeforeSetEvent<T>>): () => void;
  onAfterAdd(listener: Listener<AfterSetEvent<T>>): () => void;

  visit(visiter: (item: T) => void): void;

  selectBest(scoreStrategy: (item: T) => number): T | undefined
}

// factory pattern
function createDatabase<T extends BaseRecord>() {
  class InMemoryDatabase implements Database<T> {
    private db: Record<string, T> = {};

    private beforeAddListeners = createObserver<BeforeSetEvent<T>>();
    private afterAddListeners = createObserver<AfterSetEvent<T>>();

    public set(newValue: T): void {
      this.beforeAddListeners.publish({
        newValue,
        value: this.db[newValue.id]
      })
      this.db[newValue.id] = newValue;

      this.afterAddListeners.publish({
        value: newValue,
      })
    }

    public get(id: string): T | undefined {
      return this.db[id];
    }

    onBeforeAdd(listener: Listener<BeforeSetEvent<T>>): () => void {
      return this.beforeAddListeners.subscribe(listener);
    };
    onAfterAdd(listener: Listener<AfterSetEvent<T>>): () => void {
      return this.afterAddListeners.subscribe(listener);
    };

    //Visiter pattern
    visit(visiter: (item: T) => void): void {
      Object.values(this.db).forEach(visiter);
    }

    // Strategy pattern
    selectBest(scoreStrategy: (item: T) => number): T | undefined {
      const found: {
        max: number;
        item: T | undefined;
      } = {
        max: 0,
        item: undefined
      }

      Object.values(this.db).reduce((f, item) => {
        const score = scoreStrategy(item);
        if (score > f.max) {
          f.max = score;
          f.item = item;
        }
        return f;
      }, found);

      return found.item;
    }
  }

  // Singleton pattern
  const db = new InMemoryDatabase();
  return db;
}

const pokemonDB = createDatabase<Pokemon>();

const unsubscribe = pokemonDB.onAfterAdd(({ value }) => {
  console.log(value)
});

pokemonDB.set({
  id: 'Bulbasaur',
  attack: 50,
  defense: 50,
});

unsubscribe();

pokemonDB.set({
  id: 'Spinosaur',
  attack: 100,
  defense: 20,
});

pokemonDB.visit(item => {
  console.log(item.id)
})

// console.log(pokemonDB.get("Bulbasaur"))

const bestDefensive = pokemonDB.selectBest(({ defense }) => defense);
const bestAttack = pokemonDB.selectBest(({ attack }) => attack);

console.log(`Best attack = ${bestAttack?.id}`);
console.log(`Best defense = ${bestDefensive?.id}`);
