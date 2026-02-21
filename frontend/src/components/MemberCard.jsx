import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const MemberCard = React.forwardRef(({ member }, ref) => {
    if (!member) return null;

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const expiryStr = expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const qrValue = `${member.id}|${member.name}|${expiryStr}`;

    return (
        <div ref={ref} className="cr80-print-wrapper-root">
            <style>
                {`
                .cr80-print-wrapper-root {
                    position: absolute;
                    top: -9999px;
                    left: -9999px;
                    visibility: hidden;
                }
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background: #fff !important;
                    }
                    .cr80-print-wrapper-root {
                        position: static !important;
                        visibility: visible !important;
                        display: flex !important;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        padding: 20mm;
                    }
                }
                .cr80-card {
                    width: 85.60mm;
                    height: 53.98mm;
                    background: #000;
                    color: #fff;
                    border-radius: 3.18mm;
                    position: relative;
                    overflow: hidden;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    margin-bottom: 10mm;
                    box-sizing: border-box;
                    page-break-inside: avoid;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .card-front {
                    background: linear-gradient(135deg, #001a33 0%, #000 100%) !important;
                }
                .card-back {
                    background: #000 !important;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .accent-ring {
                    position: absolute;
                    width: 60mm;
                    height: 60mm;
                    border: 0.1mm solid rgba(0, 255, 255, 0.1);
                    border-radius: 50%;
                    top: -20mm;
                    right: -20mm;
                }
                .accent-line {
                    position: absolute;
                    height: 100%;
                    width: 0.5mm;
                    background: cyan !important;
                    left: 4mm;
                    top: 0;
                    opacity: 0.8;
                }
                .logo-box {
                    position: absolute;
                    top: 5mm;
                    left: 8mm;
                    display: flex;
                    align-items: center;
                    gap: 2mm;
                }
                .logo-icon {
                    width: 4mm;
                    height: 4mm;
                    background: cyan !important;
                    border-radius: 1mm;
                }
                .logo-text {
                    font-size: 2.5mm;
                    font-weight: 900;
                    letter-spacing: 0.5mm;
                    color: cyan !important;
                }
                .photo-holder {
                    position: absolute;
                    top: 15mm;
                    left: 8mm;
                    width: 14mm;
                    height: 14mm;
                    background: #111 !important;
                    border: 0.2mm solid cyan;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 6mm;
                    font-weight: 900;
                    color: cyan !important;
                }
                .member-info {
                    position: absolute;
                    top: 15mm;
                    left: 26mm;
                }
                .member-name {
                    font-size: 3.5mm;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.2mm;
                    margin-bottom: 1mm;
                }
                .member-id {
                    font-family: monospace;
                    font-size: 2mm;
                    color: cyan !important;
                    margin-bottom: 2mm;
                }
                .member-status {
                    display: inline-block;
                    font-size: 1.5mm;
                    font-weight: 900;
                    padding: 0.5mm 1.5mm;
                    background: cyan !important;
                    color: #000 !important;
                    border-radius: 0.5mm;
                    text-transform: uppercase;
                    letter-spacing: 0.5mm;
                }
                .footer-meta {
                    position: absolute;
                    bottom: 5mm;
                    left: 8mm;
                    display: flex;
                    gap: 10mm;
                }
                .meta-item {
                    display: flex;
                    flex-direction: column;
                }
                .meta-label {
                    font-size: 1.2mm;
                    color: #555 !important;
                    text-transform: uppercase;
                    letter-spacing: 0.3mm;
                    margin-bottom: 0.5mm;
                }
                .meta-value {
                    font-size: 1.8mm;
                    font-weight: 700;
                }
                .qr-container {
                    background: #fff !important;
                    padding: 2mm;
                    border-radius: 2mm;
                }
                .back-text {
                    position: absolute;
                    bottom: 4mm;
                    font-size: 1.25mm;
                    color: #333 !important;
                    letter-spacing: 1mm;
                    text-transform: uppercase;
                }
                `}
            </style>

            {/* Front Side */}
            <div className="cr80-card card-front">
                <div className="accent-ring" />
                <div className="accent-line" />

                <div className="logo-box">
                    <div className="logo-icon" />
                    <span className="logo-text">HEART.SYSTEM</span>
                </div>

                <div className="photo-holder">
                    {member.name.charAt(0).toUpperCase()}
                </div>

                <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-id">{member.id.toUpperCase()}</div>
                    <div className="member-status">PREMIUM ACCESS</div>
                </div>

                <div className="footer-meta">
                    <div className="meta-item">
                        <span className="meta-label">Loyalty Momentum</span>
                        <span className="meta-value">{member.points.toLocaleString()} PTS</span>
                    </div>
                </div>
            </div>

            {/* Back Side */}
            <div className="cr80-card card-back">
                <div className="qr-container">
                    <QRCodeSVG
                        value={qrValue}
                        size={120} // In pixels, but we scale it via container padding
                        style={{ width: '30mm', height: '30mm' }}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        level="H"
                        includeMargin={false}
                    />
                </div>
                <div className="meta-item" style={{ marginTop: '4mm' }}>
                    <span className="meta-label" style={{ textAlign: 'center' }}>Validity End Cycle</span>
                    <span className="meta-value" style={{ textAlign: 'center', color: 'cyan', fontSize: '2.5mm' }}>{expiryStr}</span>
                </div>
                <div className="back-text">Digital Intelligence Node v.1</div>
            </div>
        </div>
    );
});

MemberCard.displayName = 'MemberCard';

export default MemberCard;
