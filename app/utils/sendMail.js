const nodemailer = require('nodemailer');

module.exports = async (to, link) => {

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'cracsplay@gmail.com',
                pass: 'rrkioplaqgnbfmar'
            }
        });
    await transporter.sendMail({
        from: 'isac.oconner@ethereal.email',
        to,
        subject: 'Активация аккаунта на сайте' + process.env.API_URL,
        text: '',
        html:
        `
        <div>
            <h1>Для активации перейдите по ссылке:</h1>
            <a href="${link}">${link}</a>
        </div>

        `
    })
    console.log(`Email sent to ${to} for account activation.`);
    } catch (error) {
        console.error('Error occurred while sending email:', error);
    }   
}