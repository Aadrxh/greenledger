import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AngularToastifyModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'green-ledger';
}
