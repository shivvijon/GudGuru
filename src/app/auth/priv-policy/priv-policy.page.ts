import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IonContent, ScrollDetail } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-priv-policy',
  templateUrl: './priv-policy.page.html',
  styleUrls: ['./priv-policy.page.scss'],
})
export class PrivPolicyPage implements OnInit {

  @ViewChild(IonContent) content: IonContent;
  contentHeight: number;
  isTermsChecked: boolean;
  env = environment;
  loginData: any;

  constructor(private router: Router, private route: ActivatedRoute)
  {
    route.params.subscribe(param => {
      if(router.getCurrentNavigation().extras.state?.loginData) {
        this.loginData = router.getCurrentNavigation().extras.state.loginData;
      }
    });
  }


  onWindowScroll(ev: CustomEvent<ScrollDetail>)
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ev.detail.currentY > this.contentHeight - 950 ? document.getElementById('scrollDownBtn')?.classList.add('hideScrollDown') :
                            document.getElementById('scrollDownBtn')?.classList.remove('hideScrollDown');
  }

  ionViewDidEnter() {
    this.contentHeight = document.getElementById('container').scrollHeight;
  }

  ngOnInit() {
  }

  scrollDown() {
    this.content.scrollToBottom(1000);
  }

  checkTerms(event: any) {
    this.isTermsChecked = event.target.checked;
  }

  navToRegister()
  {
    const navExtras: NavigationExtras = {
      state: {loginData: this.loginData}
    };

    this.router.navigate(['/register'], navExtras);
  }

}
