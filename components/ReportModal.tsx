import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  Button, Input, Checkbox, CheckboxGroup, Textarea,
  Autocomplete, AutocompleteItem
} from "@heroui/react";
import { LocateFixed, MapPin } from "lucide-react";
import { ReportFormData } from "@/types/reports";

type ReportModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  onSubmit: () => void;
  currentInput: string;
  onLocationChange: (value: string) => void;
  agentCount: number;
  setAgentCount: (count: number) => void;
  activities: string[];
  setActivities: (activities: string[]) => void;
  otherActivity: string;
  setOtherActivity: (activity: string) => void;
  clothing: string[];
  setClothing: (clothing: string[]) => void;
  otherClothing: string;
  setOtherClothing: (clothing: string) => void;
  time: string;
  setTime: (time: string) => void;
  equipment: string[];
  setEquipment: (equipment: string[]) => void;
  otherEquipment: string;
  setOtherEquipment: (equipment: string) => void;
  details: string;
  setDetails: (details: string) => void;
  submitLoading: boolean;
  addressSuggestions: Array<{ key: string; address: string; isCustom?: boolean }>;
  handleAddressSearch: (value: string) => void;
  isLocating: boolean;
  handleLocationClick: () => void;
  setIsSelectingLocation: (value: boolean) => void;
};

export function ReportModal({ 
  isOpen, 
  onOpenChange,
  onClose,
  onSubmit: handleReport,
  currentInput,
  onLocationChange: handleAddressSearch,
  agentCount,
  setAgentCount,
  activities,
  setActivities,
  otherActivity,
  setOtherActivity,
  clothing,
  setClothing,
  otherClothing,
  setOtherClothing,
  time,
  setTime,
  equipment,
  setEquipment,
  otherEquipment,
  setOtherEquipment,
  details,
  setDetails,
  submitLoading,
  addressSuggestions,
  isLocating,
  handleLocationClick,
  setIsSelectingLocation
}: ReportModalProps) {
  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[95vw] md:max-w-[600px]">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-lg">Report a Sighting</h2>
            </ModalHeader>
            <ModalBody className="flex flex-col gap-8">
              <h6 className="text-xs text-default-500 font-extralight -mb-6">
                You can leave any field blank if you don&apos;t have information.
              </h6>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="text-sm whitespace-nowrap">How many agents?</p>
                <Input
                  className="flex-1"
                  inputMode="numeric"
                  min={1}
                  pattern="[0-9]*"
                  placeholder="Enter a number"
                  size="lg"
                  type="number"
                  value={String(agentCount || '')}
                  onChange={(e) => setAgentCount(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm">What are they doing?</p>
                <div className="flex-1">
                  <CheckboxGroup
                    className="flex flex-wrap items-start"
                    orientation="horizontal"
                    value={activities}
                    onValueChange={setActivities}
                  >
                    <div className="w-[140px]">
                      <Checkbox color="danger" value="1">Arrests</Checkbox>
                    </div>
                    <div className="w-[140px]">
                      <Checkbox color="danger" value="2">Patrols</Checkbox>
                    </div>
                    <div className="w-[140px]">
                      <Checkbox color="danger" value="3">Questioning</Checkbox>
                    </div>
                    <div className="w-[140px]">
                      <Checkbox color="danger" value="4">ID Checks</Checkbox>
                    </div>
                    <div className="w-[140px]">
                      <Checkbox color="danger" value="5">Other</Checkbox>
                    </div>
                  </CheckboxGroup>
                  {activities.includes("5") && (
                    <Input
                      className="w-full mt-2"
                      placeholder="Specify other activity"
                      size="lg"
                      value={otherActivity}
                      onChange={(e) => setOtherActivity(e.target.value)}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm">Location</p>
                <div className="flex gap-2 sm:flex-row flex-col">
                  <Autocomplete
                    aria-label="Location search"
                    className="flex-1"
                    defaultItems={addressSuggestions}
                    items={addressSuggestions}
                    inputValue={currentInput}
                    placeholder="Enter a location"
                    size="lg"
                    onInputChange={handleAddressSearch}
                    onSelectionChange={(key) => {
                      const selected = addressSuggestions.find(
                        (item) => item.key === key,
                      );
                      if (selected) {
                        const finalAddress = selected.isCustom
                          ? currentInput
                          : selected.address;
                        setCurrentInput(finalAddress);
                      }
                    }}
                  >
                    {(item) => (
                      <AutocompleteItem key={item.key}>
                        {item.address}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      color="danger"
                      isLoading={isLocating}
                      size="lg"
                      startContent={!isLocating && <LocateFixed size={16} />}
                      variant="flat"
                      onPress={handleLocationClick}
                    />
                    <Button
                      className="w-full"
                      color="danger"
                      size="lg"
                      startContent={<MapPin size={16} />}
                      variant="flat"
                      onPress={() => {
                        setIsSelectingLocation(true);
                        onOpenChange();
                      }}
                    >
                      Pick on Map
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm">What are they wearing?</p>
                <div className="flex-1">
                  <CheckboxGroup
                    className="flex flex-wrap items-start"
                    orientation="horizontal"
                    value={clothing}
                    onValueChange={setClothing}
                  >
                    <div className="w-[140px]">
                      <Checkbox color="danger" value="6">Uniform</Checkbox>
                    </div>
                    <div className="w-[140px]">
                      <Checkbox color="danger" value="7">Plain Clothes</Checkbox>
                    </div>
                    <div className="w-[140px]">
                      <Checkbox color="danger" value="8">Undercover</Checkbox>
                    </div>
                    <div className="w-[140px]">
                      <Checkbox color="danger" value="9">Other</Checkbox>
                    </div>
                  </CheckboxGroup>
                  {clothing.includes("9") && (
                    <Input
                      className="w-full mt-2"
                      placeholder="Specify other clothing"
                      size="lg"
                      value={otherClothing}
                      onChange={(e) => setOtherClothing(e.target.value)}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm">What time?</p>
                <Input
                  className="w-full"
                  placeholder="Enter a time"
                  size="lg"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm">Equipment</p>
                <div className="flex-1">
                  <CheckboxGroup
                    className="flex flex-wrap items-start"
                    orientation="horizontal"
                    value={equipment}
                    onValueChange={setEquipment}
                  >
                    <div className="w-[170px]">
                      <Checkbox color="danger" value="10">Handcuffs</Checkbox>
                    </div>
                    <div className="w-[170px]">
                      <Checkbox color="danger" value="11">Zip Cuffs</Checkbox>
                    </div>
                    <div className="w-[170px]">
                      <Checkbox color="danger" value="12">Weapons</Checkbox>
                    </div>
                    <div className="w-[170px]">
                      <Checkbox color="danger" value="13">Marked Vehicle</Checkbox>
                    </div>
                    <div className="w-[170px]">
                      <Checkbox color="danger" value="14">Unmarked Vehicle</Checkbox>
                    </div>
                    <div className="w-[170px]">
                      <Checkbox color="danger" value="15">Other</Checkbox>
                    </div>
                  </CheckboxGroup>
                  {equipment.includes("15") && (
                    <Input
                      className="w-full mt-2"
                      placeholder="Specify other equipment"
                      size="lg"
                      value={otherEquipment}
                      onChange={(e) => setOtherEquipment(e.target.value)}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm">Any other details</p>
                <Textarea
                  className="w-full"
                  placeholder="Enter any other details"
                  size="lg"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
              <p className="text-xs text-default-500 font-extralight">
                To protect the privacy of other people and respect the law, 
                you are not able to upload images. <br /><br />
                By submitting this report, you agree the information you provided
                is correct to your fullest knowledge.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="danger" isLoading={submitLoading} onPress={handleReport}>
                Report
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
} 