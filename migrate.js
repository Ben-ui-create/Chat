import {Users, Messages} from './models/index.js';

;(async () => {
  console.log('Running Migration');

  const models = [Users, Messages];

  for (const model of models) {
    try {
      console.log('model -> ', model);
      await model.sync({alter: true});
    } catch (e) {
      console.error(e);
    }
  }
})();