import fetch from 'node-fetch';
import { adresses } from './utils';

export const sendMail = async (template: string, content: any, recipient: string, subject: string) => {
    const response = await fetch(adresses.emailServer + '/send', {
        body: JSON.stringify({
            template,
            content,
            recipient,
            subject
        })
    });

    return response.status;
}