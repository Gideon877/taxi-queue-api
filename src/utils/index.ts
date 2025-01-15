import { startCase, toLower } from 'lodash';

//TODO: Need to remove this +2hrs once the solution is resolved
export const currentTimeStamp = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    return now.toISOString();
}

export const QueueConstants = {
    MAX_QUEUE_SIZE: 100,
    MAX_PASSENGERS_PER_QUEUE: 50,
    MAX_TAXIS_PER_QUEUE: 10,
    MAX_TAXI_PASSENGERS_PER_RIDE: 5,
}


export function capitalizeWords(text: string): string {
    return startCase(toLower(text));
}
