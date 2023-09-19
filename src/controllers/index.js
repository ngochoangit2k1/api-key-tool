import { initWebUserController } from "./user.controllers.js";
import { initWebKeyController } from "./key.controllers.js";
import {initWebConfigPackageController} from "./config-package.controller.js";


export function initApiController(app) {
  initWebKeyController(app);
  initWebUserController(app);
  initWebConfigPackageController(app)
}
