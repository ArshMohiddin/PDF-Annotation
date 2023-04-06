import { Component, HostListener, HostBinding } from '@angular/core';
import { PDFDocument, StandardFonts, rgb, degrees, grayscale } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  template: `<div id="pdf-viewer-con"></div>`,
})
export class AppComponent {
  title = 'mypdfapp';
  s3url =
    'https://lumen-dev-content.s3.ap-southeast-1.amazonaws.com/Get_Started_With_Smallpdf.pdf';

  public zoomValue = 100;

  x: any = undefined;
  y: any = undefined;

  inputText!: string;

  hasValues: boolean = false;
  _isListening = true;

  constructor() {
    pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }

  // @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
  //   console.log(event.clientX, event.clientY);
  // }

  @HostBinding('click')
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this._isListening) return;

    console.log(event.target);
    console.log('Clicked at:', event.offsetX, event.offsetY);
    this.x = event.offsetX;
    this.y = event.offsetY;
    console.log(this.x, this.y);

    // Code for writing text first then clicking
    // const target = event.target as Element;
    // if (target?.classList.contains('textBox')) {
    //   this._isListening = true;
    // } else {
    //   this._isListening = false;
    // }

    this._isListening = false;

    // this.hasValues = true;
    // window.removeEventListener('click', this.onClick);
  }

  async createPdf() {
    // create PDF
    const pdfDoc = await PDFDocument.create();
    this.writeText2(pdfDoc);
    this.saveFunc(pdfDoc);

    // modify existing PDF
    // this.modifyPdf();

    // setTimeout(() => {
    //   window.location.reload();
    // }, 500);
  }

  async saveFunc(pdfDoc: any) {
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'sample.pdf');
  }

  async saveFuncUrl(pdfDoc: any) {
    // Save the PDF document
    const pdfBytes = await pdfDoc.save();

    // Display the PDF document in a new window
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url);
  }

  async saveFuncSame(pdfDoc: any, pdfUrl: any) {
    const pdfBytes = await pdfDoc.save();
    await fetch(pdfUrl, { method: 'PUT', body: pdfBytes });
  }

  async modifyPdf() {
    // fetch url
    const url = this.s3url;
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    // load pdf
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // write text on fetched pdf
    this.writeText2(pdfDoc);

    // draw svg paths on fetched pdf
    // this.drawSvgPaths(pdfDoc);

    // draw rectangle on fetched pdf
    // this.addRectangle(pdfDoc);

    // save pdf
    // this.saveFunc(pdfDoc);

    // save pdf url
    // this.saveFuncUrl(pdfDoc);

    // save pdf in the same url
    this.saveFuncSame(pdfDoc, url);

    // reload the page automatically after 500 ms
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  async writeText2(pdfDoc: any) {
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    // console.log(height, width); // 841.89 595.276

    // console.log(this.x / 1.33, height - this.y / 1.33);

    firstPage.drawText(this.inputText, {
      x: this.x / 1.33,
      y: height - this.y / 1.33,
      size: 15,
      font: helveticaFont,
      color: rgb(0, 1, 0),
    });
  }

  async drawSvgPaths(pdfDoc: any) {
    const svgPath =
      'M 0,20 L 100,160 Q 130,200 150,120 C 190,-40 200,200 300,150 L 400,90';

    // add page
    // const page = pdfDoc.addPage();

    // get existing pages
    const pages = pdfDoc.getPages();

    // get first page
    const page = pages[0];

    page.moveTo(100, page.getHeight() - 5);

    page.moveDown(25);
    page.drawSvgPath(svgPath);

    page.moveDown(200);
    page.drawSvgPath(svgPath, { borderColor: rgb(0, 1, 0), borderWidth: 5 });

    page.moveDown(200);
    page.drawSvgPath(svgPath, { color: rgb(1, 0, 0) });

    page.moveDown(200);
    page.drawSvgPath(svgPath, { scale: 0.5 });
  }

  async addRectangle(pdfDoc: any) {
    const page = pdfDoc.getPages()[0];

    page.drawRectangle({
      x: 50,
      y: 300,
      width: 170,
      height: 75,
      // rotate: degrees(-15),
      borderWidth: 5,
      borderColor: grayscale(0.5),
      color: rgb(0.75, 0.2, 0.2),
      opacity: 0.5,
      borderOpacity: 0.75,
    });
  }

  async writeText(pdfDoc: any) {
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 30;
    page.drawText('Testing!', {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0.53, 0.71),
    });
  }
}
