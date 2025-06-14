import { Component } from '@angular/core';
import {TranslatePipe} from '../../translate.pipe';

@Component({
  selector: 'app-awaiting-approval',
  templateUrl: './awaiting-approval.component.html',
  standalone: true,
  imports: [
    TranslatePipe
  ],
  styleUrls: ['./awaiting-approval.component.css']
})
export class AwaitingApprovalComponent {
  constructor() { }
}
