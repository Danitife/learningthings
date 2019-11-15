import { Component, OnInit, ViewChild, ElementRef, } from '@angular/core';
import { fade } from 'src/app/animations/getstatedAnim';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserserviceService } from 'src/app/services/userservice.service';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';


@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.css'],
  animations: [fade]
})
export class GetStartedComponent implements OnInit {

  isLogPage: boolean = false;
  index;
  prev;
  prev2;
  logoimg: FileReader;
  @ViewChild('img', { static: false }) img: ElementRef;
  @ViewChild('form', { static: false }) form: ElementRef;
  @ViewChild('socmedia', { static: false }) socmedia: ElementRef;
  @ViewChild('nextbtn', { static: false }) nextbtn: ElementRef;
  START_COUNT: number = 1;
  END_COUNT: number = 8;
  count = this.START_COUNT;
  data: FormData = new FormData();
  submitted: boolean = false;





  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: UserserviceService,
    private snackbar: MatSnackBar
  ) { }

  /**
   * Validates the forms 
   */
  formData = this.fb.group({
    bizname: ['', [Validators.required]],
    bizdesc: ['', [Validators.required]],
    webtype: ['', [Validators.required]],
    logoname: ['', []],
    contactinfo: this.fb.group({
      bizmail: ['', [Validators.required, Validators.email]],
      biztel: ['', [Validators.required]],
      bizaddress: ['', [Validators.required]]
    }),
    socialmedia: this.fb.group({
      smlinkedin: ['', []],
      smpint: ['', []],
      smyoutube: ['', []],
      sminstagram: ['', []],
      smtwitter: ['', []],
      smfacebook: ['', []],
    }),
    theme: ['', []]
  });

  /**
   * @returns {string} the value of the Form elements
   */
  get bizname() { return this.formData.get('bizname') }
  get bizdesc() { return this.formData.get('bizdesc') }
  get webtype() { return this.formData.get('webtype') }
  get logoname() { return this.formData.get('logoname') }
  get bizmail() { return this.formData.get('contactinfo').get('bizmail') }
  get biztel() { return this.formData.get('contactinfo').get('biztel') }
  get bizaddress() { return this.formData.get('contactinfo').get('bizaddress') }
  get smlinkedin() { return this.formData.get('socialmedia').get('smlinkedin') }
  get smpint() { return this.formData.get("socialmedia").get('smpint') }
  get smyoutube() { return this.formData.get('socialmedia').get('smyoutube') }
  get sminstagram() { return this.formData.get('socialmedia').get('sminstagram') }
  get smtwitter() { return this.formData.get('socialmedia').get('smtwitter') }
  get smfacebook() { return this.formData.get('socialmedia').get('smfacebook') }
  get theme() { return this.formData.get('theme') }


  businessCat: object[] = [
    { name: 'Education', icon: "		fa fa-graduation-cap fa-lg" },
    { name: 'Portfolio and CV', icon: "fa fa-address-card-o fa-lg" },
    { name: 'Business', icon: "fa fa-bar-chart fa-lg" },
    { name: 'Photography and Media', icon: "	fa fa-camera fa-lg" },
    { name: 'Entertainment', icon: "fa fa-video-camera fa-lg" },
    { name: 'E-commerce', icon: "fa fa-shopping-cart fa-lg" },
    { name: 'Blog', icon: "fa fa-book fa-lg" }

  ]

  ngOnInit() {
    this.hideComponents(1);
    window.onkeyup = () => {
      this.restrictNext();
    }
  }


  /**
   * @param {Number} index - for selecting the theme and business type.
   * @author: Henshaw Samuel.
   */
  async colorate(index) {
    if (this.count == (this.START_COUNT + 5)) {
      this.prev2 = index;
    } else {
      this.prev = index;
    }
    await this.restrictNext()
  }


  /**
   * @param {Event} event- An onchange on logo select
   * Also shows the logo uploaded to the image View.
   * @author: Henshaw Samuel
   */
  logospin: boolean = false;
  async showImageProperty($event) {

    let img = $event.target.files[0];
    let regex: RegExp = /\.(jpe?g|png|gif|svg)$/i;

    if ($event.target.value.length > 0) {
      if (regex.test(img.name)) {
        this.logoimg = new FileReader();

        this.logoimg.onloadstart = () => {
          this.logospin = true;
        }

        this.logoimg.onloadend = async () => {
          this.logospin = false;
          this.img.nativeElement.src = this.logoimg.result;
          await this.data.append('logoname', img);
        }
        await this.logoimg.readAsDataURL($event.target.files[0]);

      } else {
        await this.snackbar.open(`${img.type} is not type JPG|PNG|JPEG|SVG `, "Close")
      }
    } else {
      await this.snackbar.open(`Logo not selected. NEXT below to skip `, "Close")
    }


  }


  /**
   * @param {number} value Hides the form component from view
   * Shows form component in view
   */
  hideComponents(value) {
    value = this.count;
    for (let a = 1; a <= document.getElementsByClassName('con').length; a++) {
      document.getElementById("comp" + a).style.display = "none";
    }
    document.getElementById("comp" + value).style.display = "inherit";
  }



  /**
   * Next, Back and Skips the form
   */
  async nextComp() {
    if (this.count < this.END_COUNT) {
      this.count++
    }
    await this.hideComponents(this.count);
    await this.restrictNext();
  }

  async backComp() {
    if (this.count != this.START_COUNT) {
      this.count--;
    }
    this.hideComponents(this.count);
    this.restrictNext();
  }

  async skipComp(value?) {
    if (this.count < this.END_COUNT) {
      this.count++
    }
    this.hideComponents(this.count);
    this.restrictNext();
  }

  /**
   * Restricts the next button for required fields
   */
  async restrictNext() {
    console.log(this.count)
    switch (this.count) {
      case (this.START_COUNT + 1):
        if (this.bizdesc.invalid) {
          (document.getElementById('nextbtn') as any).disabled = true;
        } else {
          (document.getElementById('nextbtn') as any).disabled = false;
        }
        break;
      case (this.START_COUNT + 2):
        if (this.prev == undefined) {
          (document.getElementById('nextbtn') as any).disabled = true;
        } else {
          (document.getElementById('nextbtn') as any).disabled = false;
        }
        break;
      case (this.START_COUNT + 3):
        if (this.logoname.invalid) {
          (document.getElementById('nextbtn') as any).disabled = false;
          (document.getElementById('skipbtn') as any).disabled = true;
        } else {
          (document.getElementById('nextbtn') as any).disabled = false;
          (document.getElementById('skipbtn') as any).disabled = true;

        }
        break;
      case (this.START_COUNT + 4):
        if (this.bizmail.valid && this.bizaddress.valid && this.biztel.valid) {
          (document.getElementById('nextbtn') as any).disabled = false;
          (document.getElementById('skipbtn') as any).disabled = true;
        } else {
          (document.getElementById('nextbtn') as any).disabled = true;
          (document.getElementById('skipbtn') as any).disabled = true;
        }
        break;
      case (this.START_COUNT + 5):
        if (this.smfacebook.valid || this.sminstagram.valid || this.smlinkedin.valid || this.smtwitter.valid || this.smpint.valid || this.smyoutube.valid) {
          (document.getElementById('nextbtn') as any).disabled = false;
          (document.getElementById('skipbtn') as any).disabled = true;
        } else {
          (document.getElementById('nextbtn') as any).disabled = false;
          (document.getElementById('skipbtn') as any).disabled = true;
        }
        break;
    }

  }





  /**
   * For submiting data to a backend RESTFul API
   */
  submitData(): void {

    this.submitted = true;

    this.data.append('bizname', this.bizname.value);
    this.data.append('bizdesc', this.bizdesc.value);
    this.data.append('webtype', this.webtype.value);
    this.data.append('bizmail', this.bizmail.value);
    this.data.append('biztel', this.biztel.value);
    this.data.append('bizaddr', this.bizaddress.value);
    this.data.append('soclinkedin', this.smlinkedin.value);
    this.data.append('socpinterest', this.smpint.value);
    this.data.append('socyoutube', this.smyoutube.value);
    this.data.append('socinstagram', this.sminstagram.value);
    this.data.append('soctwitter', this.smtwitter.value);
    this.data.append('socfacebook', this.smfacebook.value);
    this.data.append('theme', this.theme.value);

    if(this.logoname.value === "" || this.logoname.value === undefined){
      this.data.append('logoname', '');
    }

   
    this.service.postGetstated(this.data).subscribe(
        async (res: any) => {
          await console.log(res);
          this.submitted = false;
          if(res.status === 200){
            // this.router.navigate(['/dash']);
            await this.snackbar.open(res.message, 'close');
          }else{
           await this.snackbar.open(res.message, 'close');
          }
        },
        err => {
          this.snackbar.open(err , 'close');
          this.submitted = false;
        }
      )
  }

















}