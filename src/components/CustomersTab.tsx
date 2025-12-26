import type {
    CustomerSegment,
    RFMSegment,
} from '../types';
import { AdvancedCustomerSegmentation } from './AdvancedCustomerSegmentation';

interface CustomersTabProps {
    rfmSegments: RFMSegment[];
    frequencySegments: CustomerSegment[];
    recencySegments: CustomerSegment[];
    channelSegments: CustomerSegment[];
    aovSegments: CustomerSegment[];
    lifetimeValueSegments: CustomerSegment[];
}

export function CustomersTab({
    rfmSegments,
    frequencySegments,
    recencySegments,
    channelSegments,
    aovSegments,
    lifetimeValueSegments,
}: CustomersTabProps) {
    return (
        <div>
            <AdvancedCustomerSegmentation
                rfmSegments={rfmSegments}
                frequencySegments={frequencySegments}
                recencySegments={recencySegments}
                channelSegments={channelSegments}
                aovSegments={aovSegments}
                lifetimeValueSegments={lifetimeValueSegments}
            />
        </div>
    );
}

