import { LightningElement, wire, track } from "lwc";

export default class MyComponentsContainer extends LightningElement {
  @track enable1 = true;
  @track enable2 = true;
  @track enable3 = true;

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
