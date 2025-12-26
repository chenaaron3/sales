import type {
    CustomerSegment,
    RFMMatrixCell,
} from '../types';
import { AdvancedCustomerSegmentation } from './AdvancedCustomerSegmentation';
import { RFMAnalysis } from './RFMAnalysis';

interface CustomersTabProps {
    rfmMatrix: RFMMatrixCell[];
    frequencySegments: CustomerSegment[];
    ageSegments: CustomerSegment[];
    genderSegments: CustomerSegment[];
    channelSegments: CustomerSegment[];
    aovSegments: CustomerSegment[];
    lifetimeValueSegments: CustomerSegment[];
}

export function CustomersTab({
    rfmMatrix,
    frequencySegments,
    ageSegments,
    genderSegments,
    channelSegments,
    aovSegments,
    lifetimeValueSegments,
}: CustomersTabProps) {
    return (
        <div className="space-y-8">
            <RFMAnalysis rfmMatrix={rfmMatrix} />
            <AdvancedCustomerSegmentation
                frequencySegments={frequencySegments}
                ageSegments={ageSegments}
                genderSegments={genderSegments}
                channelSegments={channelSegments}
                aovSegments={aovSegments}
                lifetimeValueSegments={lifetimeValueSegments}
            />
        </div>
    );
}

