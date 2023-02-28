import { AppModule } from '../app.module';
import { MenuController } from '@ionic/angular';

export function disableSideMenu()
{
  return (constructor) => {
    const originalDidEnter = constructor.prototype.ionViewDidEnter;
    const originalWillLeave = constructor.prototype.ionViewWillLeave;

    // Disable Menu
    constructor.prototype.ionViewDidEnter = () => {

      // Get the MenuController instance
      const menuCtrl = AppModule.injector.get(MenuController);

      // Disable the side menu when entering in the page
      menuCtrl.enable(false);

      // Call the ionViewDidEnter event defined in the page
      return originalDidEnter && typeof originalDidEnter === 'function' && originalDidEnter.apply(this, arguments);
    };

    // Enable Menu
    constructor.prototype.ionViewWillLeave = () => {

      // Get the MenuController instance
      const menuCtrl = AppModule.injector.get(MenuController);

      // Enable the side menu when leaving the page
      menuCtrl.enable(true);

      // Call the ionViewWillLeave event defined in the page
      return originalWillLeave && typeof originalWillLeave === 'function' && originalWillLeave.apply(this, arguments);
    };
  };
};

