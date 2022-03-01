import React, { useEffect, useState } from 'react';
import './normalize.scss';
import './App.scss';
import { CategoryInterface, ResultInterface, SpeakerInterface, SubCategoryInterface } from './client-contracts';
import { isEmptyString, isNotEmptyString } from './utils/string.utils';

export const App = () => {
    const [speakers, setSpeakers] = useState<SpeakerInterface[]>([]);
    const [categories, setCategories] = useState<CategoryInterface[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategoryInterface[]>([]);
    const [result, setResult] = useState<ResultInterface | null>(null);

    const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');

    useEffect(() => void fetchSpeakers(), []);
    useEffect(
        () => void (isNotEmptyString(selectedSpeakerId) && fetchCategories(selectedSpeakerId)),
        [selectedSpeakerId],
    );
    useEffect(() => {
        if (isNotEmptyString(selectedSpeakerId) && isNotEmptyString(selectedCategoryId)) {
            void fetchSubCategories(selectedSpeakerId, selectedCategoryId);
        }
    }, [selectedCategoryId, selectedSpeakerId]);

    const fetchSpeakers = async (): Promise<void> => {
        try {
            const response = await fetch('https://api.itorah.com/api/Speakers/allspeakers');
            const data: SpeakerInterface[] = await response.json();
            data.sort(({ isMainSpeaker }) => (isMainSpeaker ? -1 : 1));
            setSpeakers(data);
        } catch (e) {
            throw new Error(e as string);
        }
    };
    const fetchCategories = async (speakerId: string): Promise<void> => {
        try {
            const response = await fetch(`https://api.itorah.com/api/Categories/catfilter?SpeakerID=${speakerId}`);
            const data: CategoryInterface[] = await response.json();
            setCategories(data);
        } catch (e) {
            throw new Error(e as string);
        }
    };
    const fetchSubCategories = async (speakerId: string, categoryId: string): Promise<void> => {
        try {
            const response = await fetch(
                `https://api.itorah.com/api/Categories/subfilter?CategoryID=+${categoryId}+&SpeakerID=+${speakerId}`,
            );
            const data: SubCategoryInterface[] = await response.json();
            setSubCategories(data);
        } catch (e) {
            throw new Error(e as string);
        }
    };
    const fetchSearchResults = async (categoryOrSubId: string, speakerId: string): Promise<void> => {
        try {
            const response = await fetch(
                `https://api.itorah.com/api/Shiurim/all?PageIndex=1&PageSize=20&CategoryID=+${categoryOrSubId}+&SpeakerID=+${speakerId}`,
            );
            const data: ResultInterface = await response.json();

            data.shiurList.sort((a, b) => a.speakerID - b.speakerID);
            setResult(data);
        } catch (e) {
            throw new Error(e as string);
        }
    };

    const handleSpeakerChange = (e: React.ChangeEvent<HTMLSelectElement>): void => setSelectedSpeakerId(e.target.value);
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>): void =>
        setSelectedCategoryId(e.target.value);
    const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>): void =>
        setSelectedSubCategoryId(e.target.value);
    const handleSearchButtonPress = (): void => {
        const subCategoryOrCategoryId = isNotEmptyString(selectedSubCategoryId)
            ? selectedSubCategoryId
            : selectedCategoryId;
        void fetchSearchResults(subCategoryOrCategoryId, selectedSpeakerId);
    };

    const isCategoryInputDisabled = isEmptyString(selectedSpeakerId);
    const isSubCategoryDropdownDisabled = isEmptyString(selectedSpeakerId) || isEmptyString(selectedCategoryId);

    return (
        <div className="wrapper">
            <div className="top-row">
                <select
                    className="select"
                    name="speaker-select"
                    placeholder=""
                    value={selectedSpeakerId}
                    onChange={handleSpeakerChange}
                >
                    <option selected value="">
                        All speakers
                    </option>
                    {speakers.map(({ firstName, lastName, isMainSpeaker, id }) => (
                        <option
                            key={id}
                            value={id}
                            className={isMainSpeaker ? 'main-speaker-option' : ''}
                        >{`${firstName} ${lastName}`}</option>
                    ))}
                </select>
                <select
                    disabled={isCategoryInputDisabled}
                    className="select"
                    name="category-select"
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                >
                    <option selected value="">
                        All categories
                    </option>
                    {categories.map(({ id, name, shiurCount }) => (
                        <option key={id} value={id}>{`${name}(${shiurCount})`}</option>
                    ))}
                </select>
                <select
                    name="sub-category"
                    className="select"
                    value={selectedSubCategoryId}
                    disabled={isSubCategoryDropdownDisabled}
                    onChange={handleSubCategoryChange}
                >
                    <option selected value="">
                        All subcategories
                    </option>
                    {subCategories.map(({ id, name, shiurCount }) => (
                        <option value={id} key={id}>{`${name} (${shiurCount})`}</option>
                    ))}
                </select>
                <div className="search-button" onClick={handleSearchButtonPress}>
                    Search
                </div>
            </div>
            <table>
                {result?.shiurList.map(({id, title, speakerID, speaker, sponsor, audio, video}) => {
                    return (
                        <tbody key={id}>
                            <tr>
                                <th>
                                    {speaker}
                                </th>
                            </tr>
                            <tr>
                                <td>{sponsor}</td>
                            </tr>
                            <tr>
                                <td>{title}</td>
                            </tr>
                            {isNotEmptyString(audio) && (
                                <tr>
                                    <td>
                                        <a href={audio}>
                                            <i className="fa fa-file-audio-o" />
                                        </a>
                                    </td>
                                </tr>
                            )}
                            {isNotEmptyString(video) && (
                                <tr>
                                    <td>
                                        <a href={video}>
                                            <i className="fa fa-file-video-o" />
                                        </a>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    );
                })}
            </table>
        </div>
    );
};
