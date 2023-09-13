import { initWebUserController } from "./user.controllers.js";
import {initWebKeyController} from "./key.controllers.js"
export function initApiController(app)
{initWebKeyController(app)
    initWebUserController(app);

}