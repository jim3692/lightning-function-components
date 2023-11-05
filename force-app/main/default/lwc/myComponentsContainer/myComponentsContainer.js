import { LightningElement, track } from "lwc";

export default class MyComponentsContainer extends LightningElement {
  @track enable1;
  @track enable2;
  @track enable3;

  handleChange(event) {
    switch (event.target.name) {
      case "enable1":
        this.enable1 = event.target.checked;
        break;
      case "enable2":
        this.enable2 = event.target.checked;
        break;
      case "enable3":
        this.enable3 = event.target.checked;
        break;
    }
  }
}
