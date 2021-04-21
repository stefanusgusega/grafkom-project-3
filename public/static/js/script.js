import {init} from './webgl/init.mjs';
import {Master} from './webgl/master.mjs';

export const master = new Master();

window.onload = init(master);
