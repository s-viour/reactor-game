//import * as PIXI from "pixi.js"
import {Reactor, ReactorGenerator, ReactorVent} from "./game"

//const app = new PIXI.Application();
//document.body.appendChild(app.view);

let reactor = new Reactor(5, 5);
reactor.setComponent(2, 2, new ReactorGenerator(4, 4));
reactor.setComponent(1, 2, new ReactorVent(1));
reactor.setComponent(3, 2, new ReactorVent(1));

for (let i = 0; i < 4; ++i) {
    for (let x = 0; x < 5; ++x) {
        for (let y = 0; y < 5; ++y) {
            process.stdout.write(`${reactor.heatAt(x, y)} `);
        }
        console.log('');
    }
    console.log('');
    reactor.tick();
}