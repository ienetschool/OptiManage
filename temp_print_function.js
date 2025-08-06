// Clean single ID card print function
const printIDCard = (staff) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const idCardHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ID Card - ${staff.firstName} ${staff.lastName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; background: white; }
          .page-container {
            width: 210mm; height: 297mm; display: flex; justify-content: center;
            align-items: center; padding: 20mm; margin: 0 auto;
          }
          .id-card-container { display: flex; gap: 10mm; }
          .id-card {
            width: 85mm; height: 130mm; background: white; border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); overflow: hidden;
          }
          .card-front, .card-back {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #6fa8dc 100%);
            color: white; height: 100%; position: relative;
          }
          .company-header { text-align: center; padding: 20px 15px 15px; }
          .company-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
          .company-slogan { font-size: 12px; opacity: 0.9; text-transform: uppercase; }
          .photo-section { display: flex; justify-content: center; margin: 20px 0; }
          .photo-circle {
            width: 80px; height: 80px; border-radius: 50%; background: white;
            border: 3px solid rgba(255,255,255,0.3); display: flex; align-items: center;
            justify-content: center; font-size: 28px; color: #2a5298; font-weight: bold;
          }
          .employee-info { text-align: center; padding: 20px; }
          .employee-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          .employee-position { font-size: 14px; opacity: 0.9; margin-bottom: 15px; }
          .employee-details {
            background: rgba(255,255,255,0.1); border-radius: 15px;
            padding: 20px; margin: 20px; backdrop-filter: blur(10px);
          }
          .detail-row {
            display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px;
          }
          .footer-section {
            position: absolute; bottom: 0; left: 0; right: 0;
            text-align: center; padding: 10px; font-size: 10px;
            border-top: 1px solid rgba(255,255,255,0.2);
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="id-card-container">
            <!-- Front -->
            <div class="id-card">
              <div class="card-front">
                <div class="company-header">
                  <div class="company-name">OPTISTORE PRO</div>
                  <div class="company-slogan">Medical Excellence</div>
                </div>
                <div class="photo-section">
                  <div class="photo-circle">
                    ${staff.staffPhoto ? 
                      `<img src="${staff.staffPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />` : 
                      `${staff.firstName.charAt(0)}${staff.lastName.charAt(0)}`
                    }
                  </div>
                </div>
                <div class="employee-info">
                  <div class="employee-name">${staff.firstName.toUpperCase()} ${staff.lastName.toUpperCase()}</div>
                  <div class="employee-position">${staff.position}</div>
                </div>
                <div class="employee-details">
                  <div class="detail-row">
                    <span>ID:</span><span>${staff.staffCode}</span>
                  </div>
                  <div class="detail-row">
                    <span>Email:</span><span>${staff.email || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span>Phone:</span><span>${staff.phone || 'N/A'}</span>
                  </div>
                </div>
                <div class="footer-section">
                  123 Vision Street, Eyecare City, EC 12345<br>
                  Phone: (555) 123-4567
                </div>
              </div>
            </div>
            <!-- Back -->
            <div class="id-card">
              <div class="card-back">
                <div class="company-header">
                  <div class="company-name">OPTISTORE PRO</div>
                  <div class="company-slogan">Terms & Conditions</div>
                </div>
                <div style="padding: 20px; font-size: 12px;">
                  <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">• Property of OptiStore Pro Medical</li>
                    <li style="margin-bottom: 8px;">• Must be worn during work hours</li>
                    <li style="margin-bottom: 8px;">• Report if lost or stolen</li>
                    <li style="margin-bottom: 8px;">• Valid for employment period only</li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 20px;">
                  <div style="width: 60px; height: 60px; background: white; margin: 0 auto; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: black; font-size: 10px;">
                    QR CODE
                  </div>
                </div>
                <div style="position: absolute; bottom: 10px; left: 15px; right: 15px; text-align: center; font-size: 10px; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px;">
                  Authorized Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(idCardHTML);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};