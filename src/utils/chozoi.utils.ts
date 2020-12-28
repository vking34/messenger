import axios from 'axios';
import { AccountService } from '../constants/api';

export const getUserName = async (userId: number) => {
    const url = `${AccountService}/${userId}`;
    try {
        const userResponse = await axios.get(url);
        return userResponse.data.name;
    }
    catch (e) {
        return '';
    }
}