import {init} from './webgl/init.mjs';
import {Master} from './webgl/master.mjs';

var master = new Master();

window.onload = init(master);
