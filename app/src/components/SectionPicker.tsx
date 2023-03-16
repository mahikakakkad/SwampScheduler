/*
==================================================================================
Basically the new equivalent of MultipleCourseDisplay.tsx
Takes SOC and Generator from Schedule Builder and allows for the selection of sections.
These sections are then rendered using the ScheduleDisplay.tsx component.
==================================================================================
*/

import React, {useState} from "react";
import {Course, Section, SOC} from "../scripts/soc";
import {Generator, Schedule, Selection} from "../scripts/generator";
import ScheduleDisplay from "./ScheduleDisplay";
import SectionButton from "./SectionButton";

interface props {
    soc: SOC,
    generator: Generator
}

export function SectionPicker(props: props) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectionMap, setSelectionMap] = useState<Map<string, Section[]>>(new Map<string, Section[]>());
    const [sections, setSections] = useState([]);
    const [selectedSections, setSelectedSections] = useState<Array<Section>>([]);

    const getSearchedSections = async (searchText: string) => {
        let course: Course = await (props.soc).getCourse(searchText);

        if (course == null) {
            console.log("Course not found");
            setSections([]);
        } else {
            setSections(course.sections);
            console.log(sections);
        }
    }

    const handleClickSection = (newSection: Section) => {
        if (selectedSections.includes(newSection)) {
            setSelectedSections(selectedSections.filter((section) => section !== newSection));
            let temp_selection_map = selectionMap;
            let temp_sections = temp_selection_map.get(newSection.courseCode);
            temp_sections = temp_sections.filter((section) => section !== newSection);
            if (temp_sections.length == 0) {
                temp_selection_map.delete(newSection.courseCode);
            } else {
                temp_selection_map.set(newSection.courseCode, temp_sections);
            }
            setSelectionMap(temp_selection_map);
        } else {
            setSelectedSections([...selectedSections, newSection]);
            if (!selectionMap.has(newSection.courseCode)) {
                selectionMap.set(newSection.courseCode, []);
            }
            let temp_selection_map = selectionMap;
            let temp_sections = temp_selection_map.get(newSection.courseCode);
            temp_sections.push(newSection);
            temp_selection_map.set(newSection.courseCode, temp_sections);
            setSelectionMap(temp_selection_map);
        }
        let selections: Selection[] = [];
        selectionMap.forEach((value, key) => {
            selections.push(value);
        })

        if (selections.length == 0) {
            setSchedules([])
        } else {
            props.generator.loadSelections(selections);
            props.generator.generateSchedules()
                .then((schedules: Schedule[]) => setSchedules(schedules));
        }

    }

    const section_buttons = sections.map((section) => {
        if (selectedSections.includes(section))
            return (
                <SectionButton section={section} onclick={handleClickSection} isClicked={true}/>
            )
        return (
            <SectionButton section={section} onclick={handleClickSection} isClicked={false}/>
        )
    });

    const selected_sections = selectedSections.map((section) => {
        return (
            <SectionButton section={section} onclick={handleClickSection} isClicked={true}/>
        )
    });

    const renderSchedules = () => {
        if (schedules.length === 0)
            return (<></>)
        else
            return (
                <div className='box-content h-96 w-2/3 border-2 border-slate-400 overflow-auto'>
                    {schedules.map((schedule: Schedule) =>
                        <ScheduleDisplay schedule={schedule}></ScheduleDisplay>
                    )}
                </div>
            )
    }

    return (
        <div>
            <div className="grid grid-cols-3">
                <div>
                    <input
                        type="text"
                        id="first_name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
                        placeholder="Course Code"
                        required
                        onChange={(e) => getSearchedSections(e.target.value)}
                    />
                    <div>
                        {section_buttons}
                    </div>
                </div>
                <div>
                    Selected Sections
                    <div>
                        {selected_sections}
                    </div>
                </div>
                <div>
                    Possible Schedules
                    {renderSchedules()}
                </div>
            </div>
        </div>
    )
}