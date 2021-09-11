interface Observer {
  onNewBook(...params: any[]): void;
}

interface Observable {
  on(state: string, reader: Observer): void;
  off(state: string, reader: Observer): void;
  notify(state: string, ...params: any[]): void;
}

class Reader implements Observer {
  constructor(private name: string) { }

  public onNewBook(...params: any[]) {
    console.log(this.name ,`I will go to buy the ${params} to bookstore`);
  }
}
type OListener = {
  state: string;
  readers: Observer[];
}

class Publisher implements Observable {
  private listeners: OListener[];

  constructor(public name: string) {
    this.listeners = [];
  }

  public on(state: string, reader: Reader) {
    const listener = this.getListener(state);
    if (listener && listener.readers) {
      listener.readers.push(reader);
    } else {
      this.listeners.push({
        state,
        readers: [reader]
      })
    }
  }
  public off(state: string, reader: Reader) {
    const listener = this.getListener(state);
    listener && listener.readers.splice(listener.readers.indexOf(reader), 1);
  }
  public notify(state: string, ...params: any[]) {
    const listener = this.getListener(state);
    listener && listener.readers.forEach((reader) => reader.onNewBook(params))
  }
  public getListener(state: string): OListener | undefined {
    return this.listeners.find((listener) => listener.state === state);
  }
}

const oreilly = new Publisher('oreilly');
const john = new Reader('john');
const paul = new Reader('paul');
const wakamsha = new Reader('wakamsha');

oreilly.on('release', john);
oreilly.on('release', paul);
oreilly.on('sale', wakamsha);

oreilly.notify('release', 'Beginner of JavaScript', 'Advanced React','Happy Vue');

oreilly.off('release', john);
oreilly.notify('release');
