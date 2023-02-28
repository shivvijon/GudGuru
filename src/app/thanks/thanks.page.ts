import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { FormControl,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../services/api/toast.service';

@Component({
  selector: 'app-thanks',
  templateUrl: './thanks.page.html',
  styleUrls: ['./thanks.page.scss'],
})
export class ThanksPage implements OnInit {
  paymentStatus: any;
  prevUrl: string;

  constructor( private toast: ToastService,
    private router: Router,private route: ActivatedRoute,public formBuilder: FormBuilder) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.paymentStatus = this.router.getCurrentNavigation().extras.state.data;
        this.prevUrl = this.router.getCurrentNavigation().extras.state.prevUrl;
        console.log(this.paymentStatus);

      }
    });
   }

  ngOnInit() {
  }

  navToHome() {
    this.router.navigate(['tabs'], {replaceUrl: true});
  }

}
