import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'xihucalli_web' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('xihucalli_web');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, xihucalli_web');
  });
});

describe("to parse", () => {

  it("should parse an array of strings", () => {
    const fakeResponse = "[\n" +
      "    {\n" +
      "        \"description\": \"mi cuenta de fb\",\n" +
      "        \"id\": 1754013579031,\n" +
      "        \"title\": \"facebook\",\n" +
      "        \"url\": \"Facebook.com\",\n" +
      "        \"username\": \"angeldomp49@gmail.com\"\n" +
      "    },\n" +
      "    {\n" +
      "        \"description\": \"yyz account\",\n" +
      "        \"id\": 1754013430892,\n" +
      "        \"title\": \"yyz\",\n" +
      "        \"url\": \"rock.com\",\n" +
      "        \"username\": \"yyz@rock.com\"\n" +
      "    },\n" +
      "    {\n" +
      "        \"description\": \"for fb\",\n" +
      "        \"id\": 1754013383409,\n" +
      "        \"title\": \"fb\",\n" +
      "        \"url\": \"fb.com\",\n" +
      "        \"username\": \"adp@fb.com\"\n" +
      "    },\n" +
      "    {\n" +
      "        \"description\": \"google\",\n" +
      "        \"id\": 3,\n" +
      "        \"title\": \"google account\",\n" +
      "        \"url\": \"google.com\",\n" +
      "        \"username\": \"angeldomp49\"\n" +
      "    }\n" +
      "]";

    console.log(JSON.parse(fakeResponse));
  });
});
