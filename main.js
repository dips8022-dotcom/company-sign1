class BusinessCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        window.addEventListener('resize', () => this.adjustTaglineFontSize());
    }

    disconnectedCallback() {
        window.removeEventListener('resize', () => this.adjustTaglineFontSize());
    }

    static get observedAttributes() {
        return ['name', 'name-color', 'title', 'department', 'company', 'address', 'phone', 'personal-phone', 'email', 'website', 'profile-pic', 'company-logo', 'tagline-main', 'tagline-main-color', 'tagline-sub', 'tagline-sub-color', 'background-color'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    adjustTaglineFontSize() {
        const details = this.shadowRoot.querySelector('.details');
        if (!details) return;
        const parentWidth = details.clientWidth;

        const adjust = (element, initialSize, minSize) => {
            if (!element) return;
            element.style.fontSize = initialSize + 'pt';
            void(element.offsetWidth);
            const textWidth = element.scrollWidth;
            const safetyMargin = 15;
            const availableWidth = parentWidth - safetyMargin;

            if (textWidth > availableWidth) {
                const newSize = initialSize * (availableWidth / textWidth);
                element.style.fontSize = Math.max(newSize, minSize) + 'pt';
            }
        };

        const taglineMain = this.shadowRoot.querySelector('.tagline-main');
        const taglineSub = this.shadowRoot.querySelector('.tagline-sub');
        adjust(taglineMain, 9, 4);
        adjust(taglineSub, 8, 4);
    }

    async performCapture(action) {
        const businessCardContent = this.shadowRoot.querySelector('#business-card-content');
        if (!businessCardContent) return;

        // 1. Wait for all images to be fully loaded
        const images = Array.from(businessCardContent.querySelectorAll('img'));
        const promises = images.map(img => {
            // For already loaded or cached images
            if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
            
            // For images that still need to load
            return new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
            });
        });

        try {
            await Promise.all(promises);
        } catch (error) {
            console.error('Error loading images for capture:', error);
            alert('오류: 명함의 이미지를 로드하는 중 문제가 발생했습니다. 다시 시도해 주세요.');
            return;
        }

        // 2. A short delay to ensure rendering is complete after image loads
        await new Promise(resolve => setTimeout(resolve, 200));

        // 3. Capture the content using html2canvas with robust options
        try {
            const canvas = await html2canvas(businessCardContent, {
                backgroundColor: this.getAttribute('background-color') || '#ffffff',
                useCORS: true, // Attempt to load images via CORS to prevent tainting
                scale: 2
            });

            if (action === 'copy') {
                canvas.toBlob(blob => {
                    if(blob) {
                        navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(() => {
                            alert('명함이 이미지로 복사되었습니다!');
                        }).catch(err => {
                            console.error('Clipboard write failed: ', err);
                            alert('오류: 클립보드에 명함을 복사하지 못했습니다. 브라우저 권한을 확인해 주세요.');
                        });
                    } else {
                        alert('오류: 이미지 데이터 변환에 실패했습니다.');
                    }
                }, 'image/png');
            } else if (action === 'download') {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.download = 'business-card.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err) {
            console.error('html2canvas failed: ', err);
            alert('오류: 명함 이미지 생성에 실패했습니다.');
        }
    }

    render() {
        this.shadowRoot.innerHTML = '';
        const name = this.getAttribute('name');
        const nameColor = this.getAttribute('name-color');
        const title = this.getAttribute('title');
        const department = this.getAttribute('department');
        const company = this.getAttribute('company');
        const address = this.getAttribute('address');
        const phone = this.getAttribute('phone');
        const personalPhone = this.getAttribute('personal-phone');
        const email = this.getAttribute('email');
        const website = this.getAttribute('website');
        const profilePic = this.getAttribute('profile-pic');
        const companyLogo = this.getAttribute('company-logo');
        const taglineMain = this.getAttribute('tagline-main');
        const taglineMainColor = this.getAttribute('tagline-main-color');
        const taglineSub = this.getAttribute('tagline-sub');
        const taglineSubColor = this.getAttribute('tagline-sub-color');
        const backgroundColor = this.getAttribute('background-color');
        
        const hasImages = profilePic || companyLogo;
        const hasSlogan = taglineMain || taglineSub;

        const styles = `
            :host { display: block; }
            .business-card {
                border: 1px solid #ccc;
                padding: 20px;
                border-radius: 10px;
                display: flex;
                gap: ${hasImages ? '20px' : '0'};
                align-items: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                background: ${backgroundColor || '#ffffff'};
                width: 100%;
                max-width: 380px;
                box-sizing: border-box;
            }
            .image-container {
                display: ${hasImages ? 'flex' : 'none'};
                flex-direction: column;
                gap: 5px;
                align-items: center;
                flex-shrink: 0;
            }
            .details {
                font-family: sans-serif;
                font-size: 9pt;
                flex-grow: 1;
                overflow: hidden;
                text-align: left;
            }
            .tagline {
                display: ${hasSlogan ? 'flex' : 'none'};
                flex-direction: column;
                align-items: flex-end; /* Always align to the right */
                margin-bottom: 8px;
                overflow: hidden;
            }
            .info-block {
                padding-left: ${!hasImages ? '10%' : '0'};
            }
            .profile-pic img { border-radius: 50%; width: 80px; height: 80px; object-fit: cover; }
            .company-logo img { max-height: 23px; width: auto; max-width: 100%; }
            .info-block p, .details h3, h3 { margin: 0; line-height: 1.5; color: #000; word-break: break-all; text-align: left; }
            .details a { color: #000; text-decoration: none; }
            h3 { font-weight: bold; font-size: 12pt; margin-bottom: 2px; }
            .tagline-main, .tagline-sub { white-space: nowrap; line-height: 1; }
            .tagline-main { font-weight: bold; font-size: 9pt; }
            .tagline-sub { font-size: 8pt; margin-top: 2px; }
            .actions { margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px; }
            button { padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; }
            .copy-signature { background-color: #0078D4; color: white; }
            .copy-image { background-color: #28a745; color: white; }
            .download-jpg { background-color: #ffc107; color: black; }
            .delete { background-color: #dc3545; color: white; }
            @media (max-width: 400px) {
                .business-card { flex-direction: column; }
                .details { text-align: center; }
                .info-block { padding-left: 0; }
                .info-block p, .details h3, h3 { text-align: center; }
                .tagline { align-items: center; }
            }
        `;

        const profilePicHtml = profilePic ? `<div class="profile-pic"><img src="${profilePic}" alt="프로필" crossorigin="anonymous"></div>` : '';
        const companyLogoHtml = companyLogo ? `<div class="company-logo"><img src="${companyLogo}" alt="회사 로고" crossorigin="anonymous"></div>` : '';

        const taglineHtml = `
            <div class="tagline">
                <span class="tagline-main" style="color: ${taglineMainColor || '#ff0000'}">${taglineMain || ''}</span>
                <span class="tagline-sub" style="color: ${taglineSubColor || '#000000'}">${taglineSub || ''}</span>
            </div>
        `;

        let detailsHtml = '';
        if (name) detailsHtml += `<h3 style="color: ${nameColor || '#000000'};">${name}</h3>`;
        if (title || department) detailsHtml += `<p>${title || ''}${title && department ? ' | ' : ''}${department || ''}</p>`;
        if (company) detailsHtml += `<p><strong>${company}</strong></p>`;
        if (address) detailsHtml += `<p>${address}</p>`;
        const contactParts = [phone ? `P: ${phone}` : '', personalPhone ? `M: ${personalPhone}` : ''].filter(Boolean).join(' | ');
        if (contactParts) detailsHtml += `<p>${contactParts}</p>`;
        const webParts = [];
        if (email) webParts.push(`E: <a href="mailto:${email}">${email}</a>`);
        if (website) webParts.push(`<a href="${website}" target="_blank">${website}</a>`);
        if (webParts.length > 0) detailsHtml += `<p>${webParts.join(' | ')}</p>`;

        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <div class="business-card" id="business-card-content">
                <div class="image-container">${profilePicHtml}${companyLogoHtml}</div>
                <div class="details">
                    ${taglineHtml}
                    <div class="info-block">${detailsHtml}</div>
                </div>
            </div>
            <div class="actions">
                <button class="copy-signature">서명으로 복사</button>
                <button class="copy-image">이미지로 복사</button>
                <button class="download-jpg">JPG로 다운로드</button>
                <button class="delete">삭제</button>
            </div>
        `;
        
        setTimeout(() => this.adjustTaglineFontSize(), 0);

        this.shadowRoot.querySelector('.copy-signature').addEventListener('click', () => this.copyAsCleanSignature());
        this.shadowRoot.querySelector('.copy-image').addEventListener('click', () => this.performCapture('copy'));
        this.shadowRoot.querySelector('.download-jpg').addEventListener('click', () => this.performCapture('download'));
        this.shadowRoot.querySelector('.delete').addEventListener('click', () => this.remove());
    }

    copyAsCleanSignature() {
        const name = this.getAttribute('name') || '';
        const nameColor = this.getAttribute('name-color') || '#000000';
        const title = this.getAttribute('title') || '';
        const department = this.getAttribute('department') || '';
        const company = this.getAttribute('company') || '';
        const address = this.getAttribute('address') || '';
        const phone = this.getAttribute('phone') || '';
        const personalPhone = this.getAttribute('personal-phone') || '';
        const email = this.getAttribute('email') || '';
        const website = this.getAttribute('website') || '';

        const titleAndDepartment = [title, department].filter(Boolean).join(' | ');
        const contactNumbers = [phone ? `P: ${phone}` : '', personalPhone ? `M: ${personalPhone}` : ''].filter(Boolean).join(' | ');

        const signatureHtml = `
            <table cellpadding="0" cellspacing="0" style="border: none; border-collapse: collapse; font-family: sans-serif; font-size: 10pt; color: #333;">
                <tr>
                    <td style="padding: 0; text-align: left;">
                        <p style="margin: 0; font-weight: bold; color: ${nameColor};">${name}</p>
                        ${titleAndDepartment ? `<p style="margin: 0;">${titleAndDepartment}</p>` : ''}
                        ${company ? `<p style="margin: 0; font-weight: bold;">${company}</p>` : ''}
                        ${address ? `<p style="margin: 0;">${address}</p>` : ''}
                        ${contactNumbers ? `<p style="margin: 0;">${contactNumbers}</p>` : ''}
                        <p style="margin: 0;">
                            ${email ? `<a href="mailto:${email}" style="color: #0000EE; text-decoration: none;">${email}</a>` : ''}
                            ${email && website ? ' | ' : ''}
                            ${website ? `<a href="${website}" target="_blank" style="color: #0000EE; text-decoration: none;">${website}</a>` : ''}
                        </p>
                    </td>
                </tr>
            </table>
        `;

        const plainTextSignature = [
            name, titleAndDepartment, company, address, contactNumbers, [email, website].filter(Boolean).join(' | ')
        ].filter(Boolean).join('\n');

        navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([signatureHtml], { type: 'text/html' }),
                'text/plain': new Blob([plainTextSignature], { type: 'text/plain' })
            })
        ]).then(() => {
            alert('텍스트 서명이 클립보드에 복사되었습니다.');
        }).catch(err => {
            console.error('서명 복사 실패: ', err);
            alert('오류: 서명 복사에 실패했습니다.');
        });
    }
}

customElements.define('business-card', BusinessCard);

const form = document.getElementById('business-card-form');
const preview = document.getElementById('business-card-preview');
const businessCard = preview.querySelector('business-card');

const updateCard = () => {
    const formData = new FormData(form);
    for (const [name, value] of formData.entries()) {
        if (name !== 'profile-pic' && name !== 'company-logo-input') {
            businessCard.setAttribute(name, value);
        }
    }

    const profilePicInput = document.getElementById('profile-pic');
    if (profilePicInput.files && profilePicInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => businessCard.setAttribute('profile-pic', e.target.result);
        reader.readAsDataURL(profilePicInput.files[0]);
    } else {
        businessCard.removeAttribute('profile-pic');
    }

    const companyLogoInput = document.getElementById('company-logo-input');
    if (companyLogoInput.files && companyLogoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => businessCard.setAttribute('company-logo', e.target.result);
        reader.readAsDataURL(companyLogoInput.files[0]);
    } else {
        businessCard.removeAttribute('company-logo');
    }
};

form.addEventListener('input', updateCard);
form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('명함 미리보기가 업데이트되었습니다.');
});

document.querySelectorAll('.color-palette').forEach(palette => {
    palette.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-swatch')) {
            const color = e.target.dataset.color;
            const targetInputId = e.currentTarget.dataset.for;
            const targetInput = document.getElementById(targetInputId);
            if (targetInput) {
                targetInput.value = color;
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    });
});
